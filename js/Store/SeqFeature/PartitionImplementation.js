import AbortablePromiseCache from "abortable-promise-cache";
import LRU from "quick-lru";

/*

class DataStat{
    constructor(data_array){
        this.data = data_array;
        this.mean = data_array.reduce((acc, n) => acc + n) / data_array.length;
        this.std = Math.sqrt(
            data_array.reduce((acc, n) => (n - this.mean) ** 2) / data_array.length
          );
    }
}

function t_test_1_sample(mean, m, s, n){
    if(s == 0) s = 1;
    t = (mean - m) / s * Math.sqrt(n);
    p = 1.0 - jstat.studentt.cdf(Math.abs(t), df=n - 1);
    return p;
}


function t_test_2_samples(m1, s1, n1, m2, s2, n2){
    if(s1 == 0) s1 = 1;
    if(s2 == 0) s2 = 1;
    t = (m1 - m2) / Math.sqrt(s1 ** 2 / n1 + s2 ** 2 / n2)
    df = (s1 ** 2 / n1 + s2 ** 2 / n2) ** 2 * (n1 - 1) * (n2 - 1) / (
            s1 ** 4 * (n2 - 1) / n1 ** 2 + s2 ** 4 * (n1 - 1) / n2 ** 2)
    p = 1.0 - jstat.studentt.cdf(Math.abs(t), df=int(df + 0.5))
    return p
}

class Partition{
    constructor(rd){
        this.rd = rd;
        this.mean = rd.reduce((acc, n) => acc + n) / rd.length;
        this.std = Math.sqrt(
            rd.reduce((acc, n) => (n - this.mean) ** 2) / rd.length
          );
        this.bin_band = [2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 112, 128];
    }
    get_rd_signal_bandwidth(data_array){
        var new_array = [];
        data_array.forEach((value, index) => {
            var tmp_value = 0;
            if(value > this.mean/4){
                tmp_value = this.mean/(this.std ** 2 * value);
            }else{
                tmp_value = 4/this.std ** 2
            }
            //console.log(tmp_value, this.mean, this.std, value);
            new_array.push(tmp_value);
        });
        return new_array;
    }
    call_mean_shift(repeats=3){


        const bin_size = 1000;
        const genome_size = bin_size * this.rd.length;
        var masked = new Array(this.rd.length).fill(false);

        // set the level
        var levels = new Array(this.rd.length);
        for (var b = 0; b < this.rd.length; b++){
            if (!masked[b]){
                levels[b] = this.rd[b];
            }
        }

        this.bin_band.forEach((bin_band, bin_band_index) => {

            // not masked levels
            var not_masked = masked.map((value, index) =>{ return !value });
            var nm_levels = not_masked.map((value, index) => {if(value) return this.rd[index]});

            // console.log(nm_levels.length);
            // set the mask border
            var mask_borders = [0];
            var count = 0;

            for(var i=0; i<masked.length; i++){
                if(masked[i]){
                    if (count > 0){
                        mask_borders.push(mask_borders[mask_borders.length-1] + count - 1);
                        count = 0;
                    }
                }else {count += 1;}
            }

            //console.log(mask_borders);
            // repeating steps
            for(var step=0; step< repeats; step++){
                //console.log(step);
                var isig = this.get_rd_signal_bandwidth(nm_levels);
                //console.log(isig);

                //grad = np.zeros_like(nm_levels)
                var grad = new Array(nm_levels.length).fill(0);
                //console.log('t', grad);

                for(var i=0; i< nm_levels.length; i++){
                    for(var j=i-3*bin_band; j<=i+3*bin_band+1; j++){

                        if ((j < 0) || (j >= nm_levels.length)) continue;
                        if(Math.abs(i-j) >= nm_levels.length) continue;

                        var g_value = (j-i) * Math.exp(-0.5 * (j-i) ** 2 / bin_band ** 2) * Math.exp(-0.5 * (nm_levels[i]-nm_levels[j]) ** 2 * isig[i]);
                        //console.log(g_value);
                        grad[i] += g_value;
                    }
                }
                //console.log(grad);
                // get the border
                var border = new Array();
                for(var i=0; i<grad.length; i++){
                    if (grad[i]<0 & grad[i+1] >=0) border.push(i);

                }

                border.push(grad.length - 1);
                // border = sorted(list(set(border + mask_borders)));
                //console.log(border);
                border = border.concat(mask_borders).sort((a,b)=>a-b);
                var pb = 0;
                //console.log(border);
                for(var i=0; i<border.length; i++){
                    var range_array = nm_levels.slice(pb, border[i]+1);
                    //console.log(pb, border[i]+1, range_array);
                    var range_mean = range_array.reduce((acc, n) => acc + n) / range_array.length;
                    for(var b=pb; b<border[i]; b++){
                        nm_levels[b] = range_mean;
                    }
                    pb = border[i] + 1;
                }
            }

            //set the levels
            for(var i=0; i>levels.length; i++){
                if(masked[i]){
                    levels[i] = nm_levels[i];
                }
            }
            // console.log(levels);
            //get the border

            var border = new Array();
            for(var i = 0; i<levels.length; i++){
                if(i == levels.length -1) continue;
                var diff = levels[i+1] - levels[i];

                if(diff > 0.01) border.push(i+1);
            }


            border.unshift(0);
            border.shift(levels.length);
            //console.log('t1', border);
            // reset the mask
            masked = new Array(this.rd.length).fill(false);

            // check the borders
            for(var i=1; i<border.length; i++){
                var seg = [border[i-1], border[i]];
                //console.log(seg);
                var seg_left = [border[i-1], border[i-1]];
                if(i>1){
                    seg_left[0]=border[i-2];
                } else continue;

                var seg_right= [border[i], border[i]];
                if(i<border.length-1){
                    seg_right[1] = border[i+1];
                }else continue;

                var n = seg[1]-seg[0];
                var n_left = seg_left[1] - seg_left[0];
                var n_right = seg_right[1] - seg_right[0];
                if (n<=1) continue;
                var seg_array = new DataStat(levels.slice(seg[0], seg[1]));
                //seg_mean = seg_array.reduce((acc, n) => acc + n)/seg_array.length;
                //seg_std = Math.sqrt(seg_array.reduce((acc, n) => (n - seg_mean) ** 2) / seg_array.length);

                if ((n_right <= 15) || (n_left <= 15) || n<=15){
                    var ns = 1.8 * Math.sqrt( levels[seg_left[0]]/this.mean ) * this.std;
                    if (Math.abs(levels[seg_left[0]]-levels[seg[0]]) < ns){
                        continue;
                    }

                    ns = 1.8 * Math.sqrt( levels[seg_right[0]]/this.mean ) * this.std;
                    if (Math.abs(levels[seg_right[0]]-levels[seg[0]]) < ns){
                        continue;
                    }
                }else{
                    var seg_left_array = levels.slice(seg_left[0], seg_left[1]);
                    var seg_left_1 = new DataStat(seg_left_array);

                    var seg_right_array = levels.slice(seg_right[0], seg_right[1]);
                    var seg_right_1 = new DataStat(seg_right_array);

                    var ttest_2sample_1 = t_test_2_samples(seg_array.mean, seg_array.std, seg_array.length, seg_left_1.mean, seg_left_1.std, seg_left_1.length);
                    if (ttest_2sample_1 > (0.01/genome_size* bin_size * (n+n_left))){
                        continue
                    }

                    // var ttest_2sample_2 = ttest(seg_array, seg_right_array);
                    var ttest_2sample_2 = t_test_2_samples(seg_array.mean, seg_array.std, seg_array.length, seg_right_1.mean, seg_right_1.std, seg_right_1.length);
                    if (ttest_2sample_2 > (0.01/genome_size* bin_size * (n+n_right))){
                        continue
                    }
                }
                //var ttest_1sample_1 = ttest(seg_array);
                var ttest_1sample_1 = t_test_1_sample(this.mean, seg_array.mean, seg_array.std, seg_array.length);
                if(ttest_1sample_1 > 0.05){
                    continue
                }
                var raw_seg_data = new DataStat(this.rd.slice(seg[0], seg[1]));

                for(var i=seg[0]; i<=seg[1]; i++){
                    masked[i]=true;
                    levels[i] = raw_seg_data.mean;
                }
            }

        });
        return levels;
    }
}
*/

function getMean(data) {
  return (
    data.reduce(function (a, b) {
      return a + b;
    }) / data.length
  );
}
function getSD(data) {
  let m = getMean(data);
  return Math.sqrt(
    data.reduce(function (sq, n) {
      return sq + (n - m) * (n - m);
    }, 0) /
      (data.length - 1),
  );
}

define([
  "dojo/_base/declare",
  "JBrowse/Store/SeqFeature/VCFTabix",
  "JBrowse/Model/SimpleFeature",
], function (declare, VCFTabix, SimpleFeature) {
  return declare(VCFTabix, {
    constructor() {
      this.featureCache = new AbortablePromiseCache({
        cache: new LRU({
          maxSize: 20,
        }),
        fill: this._readChunk.bind(this),
      });
    },
    async _readChunk(query) {
      const parser = await this.getParser();
      const samples = parser.samples;

      const regularizedReferenceName = this.browser.regularizeReferenceName(
        query.ref,
      );

      const end = this.browser.view.ref.end;
      let binSize = 100000;
      var bins = [];
      for (let i = 0; i < end; i += binSize) {
        bins.push({
          samples: samples.map(() => ({ score: 0, count: 0 })),
        });
      }

      let averages = samples.map(() => ({ scores: [] }));

      await this.indexedData.getLines(
        regularizedReferenceName,
        0,
        undefined,
        (line, fileOffset) => {
          const fields = line.split("\t");
          const start = +fields[1];
          const featureBin = Math.max(Math.floor(start / binSize), 0);
          bins[featureBin].start = featureBin * binSize;
          bins[featureBin].end = (featureBin + 1) * binSize;
          bins[featureBin].id = fileOffset;
          for (let i = 0; i < samples.length; i++) {
            const sampleName = samples[i];
            const score = +fields[9 + i].split(":")[2];
            averages[i].scores.push(isNaN(score) ? 0 : score);
            bins[featureBin].samples[i].score += isNaN(score) ? 0 : score;
            bins[featureBin].samples[i].count++;
            bins[featureBin].samples[i].source = sampleName;
          }
        },
      );

      const sds = averages.map(average => getSD(average.scores));
      const means = averages.map(average => getMean(average.scores));
      bins.forEach(bin => {
        bin.samples.forEach((sample, index) => {
          sample.score =
            (sample.score / sample.count - means[index]) / sds[index];
        });
      });
      return bins;
    },

    async _getFeatures(
      query,
      featureCallback,
      finishedCallback,
      errorCallback,
    ) {
      try {
        const features = await this.featureCache.get(query.ref, query);
        features.forEach(feature => {
          if (feature.end > query.start && feature.start < query.end) {
            feature.samples.forEach(sample => {
              featureCallback(
                new SimpleFeature({
                  data: Object.assign(Object.create(feature), {
                    score: sample.score,
                    source: sample.source,
                  }),
                }),
              );
            });
          }
        });

        finishedCallback();
      } catch (e) {
        errorCallback(e);
      }
    },
  });
});
