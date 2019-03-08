<template>
  <div class="home">
    <tmap class="map-main" id="'map-main'">
    </tmap>
  </div>
</template>
<script>
import TMap from '@/components/TMap'
export default {
  name: 'home',
  components:{
    'tmap':TMap
  }
}
</script>
<style lang="scss">
body,html{
  position: absolute;
  top:0;
  bottom:0;
  left:0;
  right: 0;
  padding: 0;
  margin:0;
}
.map-main{
  position: absolute;
  top:0;
  bottom:0;
  left:0;
  right: 0;

  .button-wrap{
    position: absolute;
    right:50px;
    top:30px;
    background:#fff;
    z-index:1;

    li{
      display: inline;
      padding:5px 10px;
      line-height: 40px;
      cursor: pointer;
      font-size: 15px;
      font-weight: 600;
    }
  }
}
</style>

