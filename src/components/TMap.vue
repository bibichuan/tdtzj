<template>
  <div class="t-map" :id="id">
    <slot></slot>
  </div>
</template>
<script>
import { TMap } from '@/utils/TMap'
export default {
  name: 'tmap',
  props: ['id'],
  mounted() {
    new TMap(this.id)
  }
}
</script>
<style lang="scss">
/*地图放大缩小和比例尺*/
.t-map{
    z-index: 0;
    .ol-zoom {
      position: absolute;
      bottom: 1em;
      right: 1em;
      top: inherit;
      left: inherit;
    }

    .ol-control {
      padding: 1px;
      background: #aaa;
    }

    .ol-control button {
      background: #fff;
      color: #000;
      margin: 0;
      cursor: pointer;
    }

    .ol-control .zoom-bar-in {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      border-bottom: 1px solid #aaa;
    }

    .ol-control .zoom-bar-out {
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }

    //比例尺
    .scale-line {
      background: none;
      border-radius: 4px;
      bottom: 1em;
      left: 20px;
      position: absolute;
    }

    .scale-line-inner::before {
      -moz-border-bottom-colors: none;
      -moz-border-left-colors: none;
      -moz-border-right-colors: none;
      -moz-border-top-colors: none;
      border-image: none;
      border-style: none solid solid;
      border-width: 0 3px 3px;
      bottom: -3px;
      left: -1px;
      right: -1px;
    }

    .scale-line-inner::before, .scale-line-inner::after {
      border-top: 0 none;
      content: "";
      display: block;
      height: 3px;
      position: absolute;
    }

    .scale-line-inner::after {
      -moz-border-bottom-colors: none;
      -moz-border-left-colors: none;
      -moz-border-right-colors: none;
      -moz-border-top-colors: none;
      border-image: none;
      border-style: none solid solid;
      border-width: 0 1px 1px;
      bottom: -2px;
      left: 0;
      right: 0;
    }

    .scale-line-inner::before, .scale-line-inner::after {
      border-top: 0 none;
      content: "";
      display: block;
      height: 3px;
      position: absolute;
    }

    .scale-line-inner {
      font-size: 10px;
      line-height: 1;
      margin-bottom: 7px;
      padding-bottom: 3px;
      position: relative;
      text-align: center;
      white-space: nowrap;
    }
}
</style>

