function erf(x) {
  var m = 1.0;
  var s = 1.0;
  var sum = x * 1.0;
  for (var i = 1; i < 50; i++) {
    m *= i;
    s *= -1;
    sum += (s * Math.pow(x, 2.0 * i + 1.0)) / (m * (2.0 * i + 1.0));
  }
  return (2 * sum) / Math.sqrt(3.14159265358979);
}

function getEValue(mean, sigma, rd, start, end) {
  var arr = new DataStat(rd.slice(start, end));
  //aver = np.mean(rd[start:end])
  //s = np.std(rd[start:end])
  if (arr.std == 0) {
    //s = sigma * aver / mean if sigma > 0 else 1
    if (sigma > 0) {
      arr.std = (sigma * arr.mean) / mean;
    } else {
      arr.std = 1;
    }
  }
  return t_test_1_sample(mean, arr.mean, arr.std, end - start) / (end - start);
}

function gaussianEValue(mean, sigma, rd, start, end) {
  var arr = new DataStat(rd.slice(start, end));
  // aver = np.mean(rd[start:end])
  //max = np.max(rd[start:end])
  // min = np.min(rd[start:end])

  if (arr.mean < mean) {
    var x = (arr.max - arr.mean) / (sigma * Math.sqrt(2));
    return Math.pow(0.5 * (1 + erf(x)), end - start);
  }
  var x = (min - mean) / (sigma * np.sqrt(2));
  return Math.pow(0.5 * (1 - erf(x)), end - start);
}

function adjustToEvalue(mean, sigma, rd, start, end, pval, max_steps = 1000) {
  var val = getEValue(mean, sigma, rd, start, end);
  var step = 0;
  var done = false;
  while ((val > pval) & !done & (step < max_steps)) {
    done = true;
    step += 1;
    var [v1, v2, v3, v4] = [1e10, 1e10, 1e10, 1e10];
    if (start > 0) v1 = getEValue(mean, sigma, rd, start - 1, end);
    if (end - start > 2) {
      var v2 = getEValue(mean, sigma, rd, start + 1, end);
      var v3 = getEValue(mean, sigma, rd, start, end - 1);
    }
    if (end < rd.length) {
      var v4 = getEValue(mean, sigma, rd, start, end + 1);
    }
    if (Math.min[(v1, v2, v3, v4)] < val) {
      done = false;
      if (v1 == Math.min[(v1, v2, v3, v4)]) {
        start -= 1;
        val = v1;
      }
      elif(v2 == Math.min[(v1, v2, v3, v4)]);
      {
        start += 1;
        val = v2;
      }
      elif(v3 == Math.min[(v1, v2, v3, v4)]);
      {
        end -= 1;
        val = v3;
      }
      elif(v4 == Math.min[(v1, v2, v3, v4)]);
      {
        end += 1;
        val = v4;
      }
    }
  }
  if (val <= pval) {
    return start, end;
  }
  return 0;
}

class DataStat {
  constructor(data_array) {
    this.data = data_array;
    this.mean = data_array.reduce((acc, n) => acc + n) / data_array.length;
    this.std = Math.sqrt(
      data_array.reduce((acc, n) => (n - this.mean) ** 2) / data_array.length,
    );
  }
}

function t_test_1_sample(mean, m, s, n) {
  if (s == 0) s = 1;
  var t = ((mean - m) / s) * Math.sqrt(n);
  var p = 1.0 - jStat.studentt.cdf(Math.abs(t), (df = n - 1));
  return p;
}

function t_test_2_samples(m1, s1, n1, m2, s2, n2) {
  if (s1 == 0) s1 = 1;
  if (s2 == 0) s2 = 1;
  var t = (m1 - m2) / Math.sqrt(s1 ** 2 / n1 + s2 ** 2 / n2);
  var df =
    ((s1 ** 2 / n1 + s2 ** 2 / n2) ** 2 * (n1 - 1) * (n2 - 1)) /
    ((s1 ** 4 * (n2 - 1)) / n1 ** 2 + (s2 ** 4 * (n1 - 1)) / n2 ** 2);
  var p = 1.0 - jStat.studentt.cdf(Math.abs(t), (df = parseInt(df + 0.5)));
  return p;
}

export class Partition {
  constructor(rd, mean, std) {
    this.rd = rd;
    //this.mean = rd.reduce((acc, n) => acc + n) / rd.length;
    //this.std = Math.sqrt(rd.reduce((acc, n) => (n - this.mean) ** 2) / rd.length);
    this.mean = mean;
    this.std = std;
    this.bin_bands = [
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      10,
      12,
      14,
      16,
      20,
      24,
      28,
      32,
      40,
      48,
      56,
      64,
      80,
      96,
      112,
      128,
    ];

    console.log("Partition mean and std", mean, std);
    // console.log('Partition rd', rd);
  }
  get_rd_signal_bandwidth(data_array) {
    var new_array = [];
    data_array.forEach((value, index) => {
      var tmp_value = 0;
      if (value > this.mean / 4) {
        tmp_value = this.mean / (this.std ** 2 * value);
      } else {
        tmp_value = 4 / this.std ** 2;
      }
      new_array.push(tmp_value);
    });
    return new_array;
  }

  call_mean_shift(repeats = 3) {
    const bin_size = 1000;
    // const genome_size = bin_size * this.rd.length;
    const genome_size = 2871000000;
    var masked = new Array(this.rd.length).fill(false);

    // set the level
    var levels = new Array(this.rd.length);
    for (var b = 0; b < this.rd.length; b++) {
      if (!masked[b]) {
        levels[b] = this.rd[b];
      }
    }
    // console.log(levels);
    this.bin_bands.forEach((bin_band, bin_band_index) => {
      // not masked levels at current bin
      // get boolean values
      var not_masked = masked.map((value, index) => {
        return !value;
      });

      // not masked level at current bin
      // var nm_levels = not_masked.map((value, index) => {if(value) return this.rd[index]});
      var nm_levels = [];
      not_masked.forEach((value, index) => {
        if (value) nm_levels.push(this.rd[index]);
      });

      // console.log(bin_band, nm_levels);

      // set the mask border
      var mask_borders = [0];
      var count = 0;

      for (var i = 0; i < masked.length; i++) {
        if (masked[i]) {
          if (count > 0) {
            mask_borders.push(
              mask_borders[mask_borders.length - 1] + count - 1,
            );
            count = 0;
          }
        } else {
          count += 1;
        }
      }

      mask_borders.shift();
      // repeating steps
      for (var step = 0; step < repeats; step++) {
        var isig = this.get_rd_signal_bandwidth(nm_levels);
        // console.log(isig);
        var grad = new Array(nm_levels.length).fill(0);

        for (var i = 0; i < nm_levels.length; i++) {
          for (var j = i - 3 * bin_band; j <= i + 3 * bin_band + 1; j++) {
            if (j < 0 || j >= nm_levels.length) continue;
            if (Math.abs(i - j) >= nm_levels.length) continue;

            var g_value =
              (j - i) *
              Math.exp((-0.5 * (j - i) ** 2) / bin_band ** 2) *
              Math.exp(-0.5 * (nm_levels[i] - nm_levels[j]) ** 2 * isig[i]);
            // console.log(g_value);
            grad[i] += g_value;
          }
        }
        // console.log(grad);

        // get the border
        var border = new Array();
        for (var i = 0; i < grad.length - 1; i++) {
          if ((grad[i] < 0) & (grad[i + 1] >= 0)) border.push(i);
        }

        border.push(grad.length - 1);
        border = border.concat(mask_borders).sort((a, b) => a - b);
        border = Array.from(new Set(border));

        var pb = 0;
        for (var i = 0; i < border.length; i++) {
          var range_array = nm_levels.slice(pb, border[i] + 1);
          var range_mean =
            range_array.reduce((acc, n) => acc + n) / range_array.length;

          nm_levels.fill(range_mean, pb, border[i] + 1);
          pb = border[i] + 1;
        }
      }

      for (var i = 0, j = 0; i < levels.length; i++) {
        if (not_masked[i]) {
          levels[i] = nm_levels[j];
          j++;
        }
      }

      //get the border
      var border = new Array();
      for (var i = 0; i < levels.length - 1; i++) {
        //if(i == levels.length -1) continue;
        var diff = Math.abs(levels[i + 1] - levels[i]);

        if (diff > 0.01) border.push(i + 1);
      }

      border.unshift(0);
      border.push(levels.length);
      // console.log(border);
      // reset the mask
      masked = new Array(this.rd.length).fill(false);

      // check the borders
      for (var i = 1; i < border.length; i++) {
        var seg = [border[i - 1], border[i]];
        // console.log(i, seg);
        var seg_left = [border[i - 1], border[i - 1]];
        if (i > 1) {
          seg_left[0] = border[i - 2];
        } else continue;

        var seg_right = [border[i], border[i]];
        if (i < border.length - 1) {
          seg_right[1] = border[i + 1];
        } else continue;

        var n = seg[1] - seg[0];
        var n_left = seg_left[1] - seg_left[0];
        var n_right = seg_right[1] - seg_right[0];
        if (n <= 1) continue;
        var seg_array = new DataStat(levels.slice(seg[0], seg[1]));

        if (n_right <= 15 || n_left <= 15 || n <= 15) {
          var ns = 1.8 * Math.sqrt(levels[seg_left[0]] / this.mean) * this.std;
          if (Math.abs(levels[seg_left[0]] - levels[seg[0]]) < ns) {
            continue;
          }

          ns = 1.8 * Math.sqrt(levels[seg_right[0]] / this.mean) * this.std;
          if (Math.abs(levels[seg_right[0]] - levels[seg[0]]) < ns) {
            continue;
          }
        } else {
          var seg_left_array = levels.slice(seg_left[0], seg_left[1]);
          var seg_left_1 = new DataStat(seg_left_array);

          var seg_right_array = levels.slice(seg_right[0], seg_right[1]);
          var seg_right_1 = new DataStat(seg_right_array);

          var ttest_2sample_1 = t_test_2_samples(
            seg_array.mean,
            seg_array.std,
            seg_array.data.length,
            seg_left_1.mean,
            seg_left_1.std,
            seg_left_1.data.length,
          );
          // console.log(seg_array.mean, seg_array.std, seg_array.data.length, seg_left_1.mean, seg_left_1.std, seg_left_1.data.length);
          if (
            ttest_2sample_1 >
            (0.01 / genome_size) * bin_size * (n + n_left)
          ) {
            continue;
          }

          var ttest_2sample_2 = t_test_2_samples(
            seg_array.mean,
            seg_array.std,
            seg_array.data.length,
            seg_right_1.mean,
            seg_right_1.std,
            seg_right_1.data.length,
          );
          if (
            ttest_2sample_2 >
            (0.01 / genome_size) * bin_size * (n + n_right)
          ) {
            continue;
          }
        }

        var ttest_1sample_1 = t_test_1_sample(
          this.mean,
          seg_array.mean,
          seg_array.std,
          seg_array.data.length,
        );
        if (ttest_1sample_1 > 0.05) {
          continue;
        }
        var raw_seg_data = new DataStat(this.rd.slice(seg[0], seg[1]));

        masked.fill(true, seg[0], seg[1]);
        levels.fill(raw_seg_data.mean, seg[0], seg[1]);
      }
    });
    return levels;
  }

  cnv_calling() {
    var delta = 0.25;
    var delta = delta * this.mean;
    var done = false;
    var levels = this.call_mean_shift();
    // var bin_size = 1000
    var bin_size = 100000;
    // var normal_genome_size = bin_size * levels.length;
    var normal_genome_size = 2871000000;

    //var rd = this.data;
    // console.log('levels', levels);
    while (!done) {
      done = true;

      // get the borders
      var border = new Array(1).fill(0);
      for (var i = 0; i < levels.length - 1; i++) {
        var diff = Math.abs(levels[i + 1] - levels[i]);
        if (diff > 0.01) border.push(i + 1);
      }
      border.push(levels.length);
      //console.log(test);

      // console.log('borders', border);
      for (var ix = 0; ix < border.length - 2; ix++) {
        var v1 = Math.abs(levels[border[ix]] - levels[border[ix + 1]]);
        // console.log(v1);
        if (v1 < delta) {
          var v2 = v1 + 1;
          var v3 = v1 + 1;

          if (ix > 0) {
            v2 = Math.abs(levels[border[ix]] - levels[border[ix - 1]]);
          }
          if (ix < border.length - 3) {
            v3 = Math.abs(levels[border[ix + 1]] - levels[border[ix + 2]]);
          }
          if (v1 < v2 && v1 < v3) {
            done = false;

            tmp_array = new DataStat(levels.slice(border[ix], border[ix + 2]));
            levels.fill(tmp_array.mean, border[ix], border[ix + 2]);
            border.splice(ix + 1, ix + 1);
          }
        }
      }
    }

    // 'Calling Segments')
    var min = this.mean - delta;
    var max = this.mean + delta;

    //var flags = [""] * levels.length;
    var flags = new Array(levels.length).fill("");
    var segments = [];

    var b = 0;
    while (b < levels.length) {
      var b0 = b;
      var bs = b;
      while ((b < levels.length) & (levels[b] < min)) b += 1;
      var be = b;
      if (be > bs + 1) {
        var adj = adjustToEvalue(
          this.mean,
          this.std,
          this.rd,
          bs,
          be,
          (0.05 * bin_size) / normal_genome_size,
        );
        if (adj) {
          var bs,
            be = adj;
          segments.push([bs, be + 1]);
          // flags[bs:be] = ["A"] * (be - bs)
          flags.fill("D", bs, be);
        }
      }
      bs = b;
      while ((b < levels.length) & (levels[b] > max)) b += 1;
      be = b;
      if (be > bs + 1) {
        adj = adjustToEvalue(
          this.mean,
          this.std,
          this.rd,
          bs,
          be,
          (0.05 * bin_size) / normal_genome_size,
        );
        if (adj) {
          bs, (be = adj);
          segments.push([bs, be, +1]);
          // flags[bs:be] = ["A"] * (be - bs)
          flags.fill("A", bs, be);
        }
      }
      if (b == b0) b += 1;
    }

    //  Calling additional deletions
    b = 0;
    while (b < levels.length) {
      while ((b < levels.length) & (flags[b] != "")) b += 1;
      bs = b;
      while ((b < levels.length) & (levels[b] < min)) b += 1;
      be = b;
      if (be > bs + 1) {
        if (
          gaussianEValue(this.mean, this.std, this.rd, bs, be) <
          0.05 / normal_genome_size
        ) {
          segments.push([bs, be, -1]);
          flags.fill(["d"] * (be - bs), bs, be);
        }
        b -= 1;
      }
      b += 1;
    }

    b = 0;
    var cf;
    if (b < levels.length) {
      cf = flags[b];
    }

    bs = 0;

    var merge = [...this.rd];
    while (b < levels.length) {
      while (flags[b] == cf) {
        b += 1;
        if (b >= flags.length) break;
      }
      if (b > bs) {
        var merge_arr = new DataStat(merge.slice(bs, b));
        merge.fill(merge_arr.mean, bs, b);
      }
      if (b < levels.length) cf = flags[b];
      bs = b;
    }
    return merge;
  }
}
