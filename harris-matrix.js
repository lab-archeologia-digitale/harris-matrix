/* jshint esversion: 6 */


class HarrisMatrix {

  constructor() {
    this.key = 'hmdata';
  }

  /**
   * Saves JSON data, as string, to localStorage.
   * @param {string|object} json 
   */
  save2ls(json){
    if (typeof json === 'object'){
      json = JSON.stringify(json);
    }
    localStorage.setItem(this.key, json);
  }

  /**
   * Gets JSON data from localStorage, if available
   * @param {string|null} string 
   * @returns {object|false}
   */
  getFromLs(string){
    if (string){
      return localStorage.getItem(this.key);
    } else {
      if (localStorage.getItem(this.key)){
        return JSON.parse(localStorage.getItem(this.key));
      } else {
        return false;
      }
    }
  }

  /**
   * Deletes data from localStorage
   */
  deleteFromLs(){
    localStorage.removeItem(this.key);
  }

  /**
   * Converts JSON data to graphviz dot
   * @param {string|object} data 
   * @returns {string}
   */
  _json2dot(data){
    if (typeof data === 'string' ) {
      data = JSON.parse(data);
    }
    if(typeof data !== 'object'){
      console.log('JSON not well formatted');
      return false;
    }
    if(typeof data.rel === 'undefined'){
      console.log('JSON not well formatted: rel key is required');
      return false;
    }
    let dot = [];
    if( typeof data.clusters !== 'undefined'){
      Object.keys(data.clusters).map( k => {
        data.clusters[k].els.map(us => {
          dot.push(`${us} [${data.clusters[k].style}];`);
        });
      });
    }
    data.rel.map( r => {
      dot.push(`${r[0]} -> ${r[1]};`);
    });

    return dot.join("\n");
  }

  /**
   * Builds matrix
   * @param {string|object|false} json 
   * @param {object} dest 
   * @param {object} opts 
   * @param {function} cb 
   * @returns {self}
   */
  build(json, dest, opts, cb) {

    if (!json || json === ''){
      json = this.getFromLs();
    }

    if (!json || json === ''){
      console.log('No data available');
      return false;
    }
    const concentrate = opts.conecentrate ? true : false;
    const png = opts.png ? true : false;
    const splines = opts.splines ? opts.splines : 'ortho';

    const dot = 'digraph { ' +
      (concentrate ? 'concentrate=true; ' : '') +
      'splines=' + splines + '; ' +
      this._json2dot(json) + '}';

    let result = Viz(dot, { format: "svg" });

    if (png) {

      result = Viz.svgXmlToPngImageElement(result);
      result.removeAttribute('width');
      result.removeAttribute('height');
      result.classList.add('img-fluid');
      dest.innerHTML = '';
      dest.appendChild(result);

    } else {

      dest.innerHTML = result;
      let svg = document.querySelector('svg');

      if (typeof cb === 'function') {
        [].forEach.call(document.querySelectorAll('g.node'), el => {
          el.addEventListener('click', function() {
            cb(el);
          });
        });
      }

      let panZoom = svgPanZoom(svg, {
        zoomEnabled: true,
        controlIconsEnabled: true,
        fit: true,
        center: true,
        minZoom: 0.1
      });
      svg.addEventListener('paneresize', function(e) {
        panZoom.resize();
      }, false);
      window.addEventListener('resize', function(e) {
        panZoom.resize();
      });
    }
    return this;
  }

}
