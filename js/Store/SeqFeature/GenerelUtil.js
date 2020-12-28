
import LM from 'ml-levenberg-marquardt';


export class GetFit{
    constructor(avgbin){
        this.avgbin = avgbin

    }
    get_all_normal_rd(){
        let chr_score = [];
        for ( const chr in this.avgbin){
            // chr_int = parseInt(chr);
            if(parseInt(chr) < 23){
                for (let bin in this.avgbin[chr]){
                    chr_score.push(this.avgbin[chr][bin].bin_score);
                    // chr_score.push(this.avgbin[chr][bin].gc_corrected);
                }
            }
        }
        return chr_score;
    }
    get_all_gc_rd(){
        let chr_score = [];
        for ( const chr in this.avgbin){
            // chr_int = parseInt(chr);
            if(parseInt(chr) < 23){
                for (let bin in this.avgbin[chr]){
                    chr_score.push(this.avgbin[chr][bin].gc_corrected);
                }
            }
        }
        return chr_score;
    }
    max_rd(){
        let chr_score = this.get_all_normal_rd();
        console.log(chr_score);
        const chr_mean_rd = this.getMean(chr_score);
        const max_rd = parseInt(10 * chr_mean_rd +1);
        return max_rd;

    }
    fit_data(data_type){
        let chr_score;
        if(data_type != 'gc'){
            console.log(' normal rd')
            chr_score = this.get_all_normal_rd();
        }else{
            console.log(' gc rd')
            chr_score = this.get_all_gc_rd();
        }
        const chr_mean_rd = this.getMean(chr_score);
        const max_rd = parseInt(10 * chr_mean_rd +1);

        // const max_rd = this.max_rd();
        const rd_bin_size = parseInt(max_rd/10000);

        const max_value = parseInt(max_rd/rd_bin_size )* rd_bin_size + rd_bin_size;
        const range_data = range_function(0, max_value, step = rd_bin_size);

        const dist_p = this.histogram(chr_score, range_data);
        let fit_data = fit_normal(range_data, dist_p);
        // console.log('fit', fit_data);
        return [fit_data, max_rd];

    }

    histogram(data, bins){
        const step = bins[1]-bins[0];
        const hist_bins = []

        data.forEach((value, index) => {
            bins.forEach((bin_value, bin_index) => {
                if(!hist_bins[bin_value]){
                    hist_bins[bin_value] = { count:0 };
                }
                if(bin_value <= value && value < bin_value+step){
                    hist_bins[bin_value].count++;
                    return false;
                }
            });
        });
        const dist_p = [];
        hist_bins.forEach((bin, index) => {dist_p.push(bin.count)});

        return dist_p ;
    }
    getMean(data) {
        return (
          data.reduce(function (a, b) {
            return a + b;
          }) / data.length
        );
    }
}
function get_fit_info(avgbin){
    let chr_score = [];
    for ( const chr in avgbin){
        chr_score.push(avgbin[chr][bin].bin_score);
    }
}

function range_function(start, stop, step){
    const data_array = Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) => x + y * step);
    return data_array;
  }

function histogram(data, bins){
    const step = bins[1]-bins[0];
    const hist_bins = []

    data.forEach((value, index) => {
        bins.forEach((bin_value, bin_index) => {
            if(!hist_bins[bin_value]){
                hist_bins[bin_value] = { count:0 };
            }
            if(bin_value <= value.bin_score && value.bin_score < bin_value+step){
                hist_bins[bin_value].count++;

                return false;
            }
        });
    });
    const dist_p = [];
    hist_bins.forEach((bin, index) => {dist_p.push(bin.count)});

    return dist_p ;
}

function get_mean_sigma_from_histogram(bins, dist_p){
    bins.forEach((value, index) => {


    });

}


function fit_normal(bins, dist_p){

    //var sum_xy = bins.reduce((a, b) => (a + b)) / nums.length;
    var sum_xy = bins.reduce(function(r, a, i){return r + a*dist_p[i]},0);
    var sum_y = dist_p.reduce((a, b) => (a + b));
    var mean = sum_xy/sum_y;
    //var sigma = dist_p.reduce((r, a, i) => (r * Math.pow(a* bins[i]-mean, 2)))/ sum_y;

    //console.log(bins.length, dist_p.length, mean);
    var sigma = Math.sqrt(dist_p.reduce((r, a, i) => {return r + a * Math.pow(bins[i] - mean, 2)})/mean);
    var area = dist_p.reduce(
      (r, a, i) => {
        if(i < dist_p.length -1){
          //console.log(r + a * (bins[i+1]-bins[i]));
          return r + a * (bins[i+1]-bins[i]);
        }else{
          return r;
        }
      }
    );
    // console.log(bins);
    // console.log('area, mean, sigma');
    // console.log( area, mean, sigma);
    //console.log();
    //var mean = sum(x * y) / sum(y)
    //var sigma = np.sqrt(sum(y * (x - mean) ** 2) / sum(y))
    //var area = sum(y[:-1] * (x[1:] - x[:-1]))
    let data = {x: bins, y: dist_p};
    const options = {
      damping: 1.5,
      initialValues: [area, mean, sigma],

    };

    // console.log('fit_result');
    let fittedParams = LM(data, Gaussian, options);
    let fit_data = {
        area : fittedParams.parameterValues[0],
        mean : fittedParams.parameterValues[1],
        sigma : fittedParams.parameterValues[2],
    }

    // console.log(fittedParams.parameterValues);
    return fit_data;
  }

function Gaussian([a, x0, sigma]){
    // return a * np.exp(-(x - x0) ** 2 / (2 * sigma ** 2)) / np.sqrt(2 * np.pi) / sigma
    return (x) => a * Math.exp(- Math.pow((x - x0), 2) / (2 * Math.pow(sigma, 2))) / (Math.sqrt(2 * Math.PI) * sigma);
}

// export {};
export {range_function, histogram, fit_normal, Gaussian};