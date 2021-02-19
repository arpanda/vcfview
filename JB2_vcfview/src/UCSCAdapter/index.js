import {
  ConfigurationSchema,
  readConfObject,
} from "@jbrowse/core/configuration";
import { ObservableCreate } from "@jbrowse/core/util/rxjs";
import { BaseFeatureDataAdapter } from "@jbrowse/core/data_adapters/BaseAdapter";
import SimpleFeature from "@jbrowse/core/util/simpleFeature";
import stringify from "json-stable-stringify";

export const configSchema = ConfigurationSchema(
  "UCSCAdapter",
  {
    base: {
      type: "fileLocation",
      description: "base URL for the UCSC API",
      defaultValue: {
        uri: "https://api.genome.ucsc.edu",
      },
    },
    track: {
      type: "string",
      description: "the track to select data from",
      defaultValue: "",
    },
  },
  { explicitlyTyped: true },
);

export function ucscProcessedTranscript(feature) {
  const children = feature.children();
  // split the blocks into UTR, CDS, and exons
  const thickStart = feature.get("cdsStart");
  const thickEnd = feature.get("cdsEnd");

  if (!thickStart && !thickEnd) {
    return feature;
  }

  const blocks = children
    ? children
        .filter(child => child.get("type") === "block")
        .sort((a, b) => a.get("start") - b.get("start"))
    : [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newChildren = [];
  blocks.forEach(block => {
    const start = block.get("start");
    const end = block.get("end");
    if (thickStart >= end) {
      // left-side UTR
      const prime = feature.get("strand") > 0 ? "five" : "three";
      newChildren.push({
        type: `${prime}_prime_UTR`,
        start,
        end,
      });
    } else if (thickStart > start && thickStart < end && thickEnd >= end) {
      // UTR | CDS
      const prime = feature.get("strand") > 0 ? "five" : "three";
      newChildren.push(
        {
          type: `${prime}_prime_UTR`,
          start,
          end: thickStart,
        },
        {
          type: "CDS",
          start: thickStart,
          end,
        },
      );
    } else if (thickStart <= start && thickEnd >= end) {
      // CDS
      newChildren.push({
        type: "CDS",
        start,
        end,
      });
    } else if (thickStart > start && thickStart < end && thickEnd < end) {
      // UTR | CDS | UTR
      const leftPrime = feature.get("strand") > 0 ? "five" : "three";
      const rightPrime = feature.get("strand") > 0 ? "three" : "five";
      newChildren.push(
        {
          type: `${leftPrime}_prime_UTR`,
          start,
          end: thickStart,
        },
        {
          type: `CDS`,
          start: thickStart,
          end: thickEnd,
        },
        {
          type: `${rightPrime}_prime_UTR`,
          start: thickEnd,
          end,
        },
      );
    } else if (thickStart <= start && thickEnd > start && thickEnd < end) {
      // CDS | UTR
      const prime = feature.get("strand") > 0 ? "three" : "five";
      newChildren.push(
        {
          type: `CDS`,
          start,
          end: thickEnd,
        },
        {
          type: `${prime}_prime_UTR`,
          start: thickEnd,
          end,
        },
      );
    } else if (thickEnd <= start) {
      // right-side UTR
      const prime = feature.get("strand") > 0 ? "three" : "five";
      newChildren.push({
        type: `${prime}_prime_UTR`,
        start,
        end,
      });
    }
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newData = {};
  feature.tags().forEach(tag => {
    newData[tag] = feature.get(tag);
  });
  newData.subfeatures = newChildren;
  newData.type = "mRNA";
  newData.uniqueId = feature.id();
  delete newData.chromStarts;
  delete newData.chromStart;
  delete newData.chromEnd;
  delete newData.chrom;
  delete newData.blockStarts;
  delete newData.blockSizes;
  delete newData.blockCount;
  delete newData.thickStart;
  delete newData.thickEnd;
  const newFeature = new SimpleFeature({
    data: newData,
    id: feature.id(),
  });
  return newFeature;
}

export class AdapterClass extends BaseFeatureDataAdapter {
  constructor(config) {
    super(config);
    this.config = config;
  }

  getFeatures(region) {
    const { assemblyName, start, end, refName } = region;
    return ObservableCreate(async observer => {
      const { uri } = readConfObject(this.config, "base");
      const track = readConfObject(this.config, "track");
      try {
        const result = await fetch(
          `${uri}/getData/track?` +
            `genome=${assemblyName};track=${track};` +
            `chrom=${refName};start=${start};end=${end}`,
        );
        if (!result.ok) {
          throw new Error(
            `Failed to fetch ${result.status} ${result.statusText}`,
          );
        }
        const data = await result.json();
        data[track].forEach(feature => {
          let data = {
            ...feature,
            start:
              feature.chromStart ||
              feature.tStart ||
              feature.genoStart ||
              feature.txStart,
            end:
              feature.chromEnd ||
              feature.tEnd ||
              feature.genoEnd ||
              feature.txEnd,
            strand: { "-": -1, "+": 1 }[feature.strand] || 0,
            refName: feature.chrom || feature.genoName || feature.tName,
            uniqueId: stringify(feature),
          };

          if (data.blockCount && data.chromStarts) {
            data.chromStarts = data.chromStarts.split(",").map(i => +i);
            data.blockSizes = data.blockSizes.split(",").map(i => +i);
            data.subfeatures = [];
            for (let i = 0; i < +data.blockCount; i++) {
              data.subfeatures.push({
                start: data.start + data.chromStarts[i],
                end: data.start + data.chromStarts[i] + data.blockSizes[i],
              });
            }
            observer.next(new SimpleFeature(data));
          } else if (data.exonCount && data.exonStarts) {
            const exonStarts = data.exonStarts.split(",").map(i => +i);
            const exonEnds = data.exonEnds.split(",").map(i => +i);

            data.subfeatures = [];
            for (let i = 0; i < data.exonCount; i++) {
              data.subfeatures.push({
                start: exonStarts[i],
                end: exonEnds[i],
                type: "block",
              });
            }
            delete data.exonStarts;
            delete data.exonEnds;
            delete data.exonCount;
            data = ucscProcessedTranscript(new SimpleFeature(data));
            observer.next(data);
          } else {
            observer.next(new SimpleFeature(data));
          }
        });
        observer.complete();
      } catch (e) {
        observer.error(e);
      }
    });
  }

  async getRefNames() {
    const arr = [];
    for (let i = 0; i < 23; i++) {
      arr.push(`chr${i}`);
    }
    return arr;
  }

  freeResources() {}
}
