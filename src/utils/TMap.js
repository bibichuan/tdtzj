import Map from 'ol/Map.js'
import View from 'ol/View.js'
import { getTopLeft } from 'ol/extent.js'
import { get as getProjection } from 'ol/proj.js'
import LayerGroup from 'ol/layer/Group'
import WMTS from 'ol/source/WMTS.js'
import WMTSTileGrid from 'ol/tilegrid/WMTS.js'
import TileLayer from 'ol/layer/Tile.js'
import fetchJsonp from './fetchJsonp'
import _without from 'lodash/without'
import _debounce from 'lodash/debounce'
// import TileWMS from 'ol/source/TileWMS.js';

let projection = getProjection('EPSG:4326')
let maxLevel = 20
export class TMap {
  layerArray=[];//地图图层数组
  events={};//地图事件列表
  constructor (id, center = [120.158, 30.267], level = 16, maptype = 'emap') {
    this.maptype = maptype;
    this.level=level;
    this.center=center;

    let tmap = new Map({
      logo: false,
      target: id,
      // interactions: new ol.interaction.defaults({
      //   pinchRotate: false
      // }),
      // controls: [
      //   new ol.control.ScaleLine({ className: "scale-line", minWidth: "45" }),
      //   new ol.control.Zoom({ className: "zoom-bar" })
      // ],
      // layers: [
      //   new TileLayer({
      //     source: new TileWMS({
      //       url: 'https://ahocevar.com/geoserver/wms',
      //       params: {
      //         'LAYERS': 'ne:NE1_HR_LC_SR_W_DR',
      //         'TILED': true
      //       }
      //     })
      //   })
      // ],
      view: new View({
        center: center,
        projection: projection,
        zoom: level,
        maxZoom: maxLevel,
        minZoom: 2
      }),
      moveTolerance: 10
    })
    this.tmap=tmap;
    this.setOnlineMapType(maptype, center, level)
  }
  getMapType() {
    return this.maptype;
  }
  setOnlineMapType (maptype, center, zoom) {
    //请求天地图图层
    var view = this.tmap.getView();
    var bbox = view.calculateExtent().join(',');
    //fetchJsonp("http://121.43.99.232:8899/api/maplayer/current",{
    fetchJsonp('http://www.zjditu.cn/api/maplayer/current', {
      bbox: bbox, zoom: zoom
    }).then((response) => {
      return response.json();
    }).then((response) => {
      if (response.code === 200) {
        this.addOnlineMap(maptype, center, zoom, response.content);
      }
    }).catch((error) => {
      if(error.message.indexOf('abort')>=0) {
        console.log(error.message);
      }else {
        console.log(error.message);
        //如果请求超时，重新请求
        if(error.message.indexOf('time')>=0) {
          this.setOnlineMapType(maptype, center, zoom);
        }
      }
    });
  }
  //加载在线地图
  addOnlineMap(maptype, center, level, mapConfigArray) {
    //如果当前的地图类型不是目标类型，则切换
    let currentMapType =this.getMapType();
    let targetTypeMap=null;//目标图层
    let currentTypeMap=null;//当前图层
    let mapColle = this.tmap.getLayers().getArray();
    for (let i = 0; i < mapColle.length; i++) {
      if (mapColle[i].get('name')===currentMapType) {
        currentTypeMap=mapColle[i];
      }
      if(mapColle[i].get('name')===maptype) {
        targetTypeMap=mapColle[i];
      }
    }
    if (currentMapType !== maptype) {
      currentTypeMap.setVisible(false);
    }else {
      targetTypeMap=currentTypeMap;
    }
    if (targetTypeMap) {
      targetTypeMap.setVisible(true);
    } else {
      targetTypeMap = new LayerGroup({
        name: maptype,
        isBaseLayers: true,
        layers: []
      })
      this.tmap.addLayer(targetTypeMap);
    }
    //判断哪些图层是当前图层数组中没有的，没有的加上，如果配置文件中没有，在当前图层数组中存在，则删除图层，不再加载
    //如果执行请求current函数后，图层名称没有变化，则不进行下面的加载图层代码执行
    let templayerNameArray=[];
    for(let mapConfig of mapConfigArray) {
      templayerNameArray.push(mapConfig.id);
    }
    let targetLayerColle=targetTypeMap.getLayers();
    let targetLayers=targetLayerColle.getArray();
    for(let i=0;i< targetLayers.length;i++) {
      let layer=targetLayers[i];
      let layerid=layer.get('id');
      if(templayerNameArray.indexOf(layerid)>=0) {
        continue;
      }else {
        targetLayerColle.remove(layer);
        i--;
        this.layerArray=_without(this.layerArray, layerid);
      }
    }
    //建立图层
    var layerArray = [];
    var layerCount = mapConfigArray.length;
    for (let i = 0; i < layerCount; i++) {
      var mapConfig = mapConfigArray[i];

      //如果存在同名图层，不再加载，避免了函数遍历
      if (this.layerArray.indexOf(mapConfig.id)>=0) {
        continue;
      }
      var url=mapConfig.url
      if (url.indexOf('{s}') >= 0) {
        url=url.replace('{s}', '{0-6}');
      }
      //判断加载的图层
      var tagsFlag = -1;
      switch (maptype) {
        case 'img':
          tagsFlag = mapConfig.tags.search(/img(?!.)|(?:img,label)/);
          break;
        case 'img_2000':
          tagsFlag = mapConfig.tags.search(/img_2000/);
          break;
        case 'img_70':
          tagsFlag = mapConfig.tags.search(/img_70/);
          break;
        case 'img_60':
          tagsFlag = mapConfig.tags.search(/img_60/);
          break;
        default:
          tagsFlag = mapConfig.tags.search(/road(?!.)|(?:road,label)/);
          break;
      }
      if (tagsFlag >= 0) {
        //var minR = mapConfig.max; //最小分辨率
        //var maxR = mapConfig.min-1; //最大分辨率
        let source= new WMTS({
          url: url,
          id:mapConfig.id,
          style: mapConfig.style,
          format: mapConfig.format,
          layer: mapConfig.layer,
          matrixSet: mapConfig.wmts_tile_matrixset,
          projection:projection,
          tileGrid: new WMTSTileGrid({
            origin: this.origin,
            resolutions: this.resolutions,
            matrixIds: this.matrixIds
          })
        });
        source.on('tileloaderror', function(event) {
          console.log(event)
          //let tile=event.tile
          //let img=tile.getImage();
          //img.src=require('../assets/images/zjbg.png');
        });
        var newlayer = new TileLayer({
          name: mapConfig.name,
          id:mapConfig.id,
          group: maptype,
          isBaseLayers: mapConfig.baselayer,
          source:source,
          //minResolution: this.resolutions[minR],
          //maxResolution: this.resolutions[maxR],
          zIndex: mapConfig.zindex ? mapConfig.zindex : 0
        });
        layerArray.push(newlayer);
        //存储图层名称
        this.layerArray.push(mapConfig.id);
      }
    }
    //加入图层组
    targetTypeMap.getLayers().extend(layerArray);

    this.maptype = maptype;
    if (!this.events['moveend']) {
      this.events['moveend'] = this.tmap.on('moveend', _debounce((event) => {
        let view=this.tmap.getView();
        this.setOnlineMapType(this.getMapType(), view.getCenter(), view.getZoom());
      }, 500));
    }
    return targetTypeMap;
  }
}
Object.assign(TMap.prototype, {
  maxLevel: 20,
  projection: projection,
  origin: (function () {
    let projection = getProjection('EPSG:4326')
    let projectionExtent = projection.getExtent()
    return getTopLeft(projectionExtent)
  })(),
  resolutions: [1.40625, 0.703125, 0.3515625, 0.17578125, 0.087890625, 0.0439453125, 0.02197265625, 0.010986328125,
    0.0054931640625, 0.00274658203125, 0.001373291015625, 0.0006866455078125, 0.00034332275390625, 0.000171661376953125,
    0.0000858306884765625, 0.00004291534423828125, 0.000021457672119140625, 0.000010728836059570312, 0.000005364418029785156,
    0.000002682209014892578, 0.000001341104507446289],
  matrixIds: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
})
