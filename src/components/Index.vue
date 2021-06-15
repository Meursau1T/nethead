<template>
  <div id="Index" class="container">
    <div class="cards" v-bind:key="crd.text" v-for="crd in card" :style="crd.style">
      <div v-if="crd.add" @click="adderOfCard(crd)">
        <h2>{{ crd.text }}</h2>
      </div>
      <div v-else>
        <button @click="changeSetting(crd)">{{crd.setting}}</button>
        <div v-if="crd.setting">
            <input type="text" name="resize" :placeholder="getArea(crd)" />
            <input type="text" name="title" :placeholder="crd.title" />
            <input type="text" name="target" :placeholder="crd.target" />
            <button @click="changeSize($event,crd)">resize</button>
        </div>
        <h2 style="display:flex">{{crd.text}}</h2>
        <div v-for="pair in crd.data" v-bind:key="pair.title" align="left">
            <a :href="pair['link']">{{pair["title"]}}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import axios from 'axios';
export default defineComponent({
  name: "Index",
  props: {},
  components: {},
  methods: {
    expandGrid(max) {
        this.rows = max + 2;
    },
    changeSetting(card){
        card.setting = !card.setting;
    },
    getRss(crd){
        axios.get('/users',{
            params:{
                target: crd.target
            }
        }).then((res) => {
          crd.data = res["data"];
        });
    },
    getArea(card){
        return card.style.match(/\d+/g);
    },
    changeSize(event,card) {
      let inputStr = event.target.parentNode.getElementsByTagName("input")[0].value;
      let gridArea = inputStr.split(" ").map((x) => parseInt(x));
      card["style"] = "grid-column : "+ gridArea[0]  +" / "+ gridArea[1] +"; grid-row : "+ gridArea[2] +" / "+ gridArea[3] +" ";
      this.expandGrid(gridArea[3]);
    },
    newAdder() {
      let cards = Array.from(document.getElementsByClassName("cards"));
      let pos = cards.map((x) => {
        let res = [];
        res.push(parseInt(x.style["grid-column-start"]) - 1);
        res.push(parseInt(x.style["grid-column-end"]) - 1);
        res.push(parseInt(x.style["grid-row-start"]) - 1);
        res.push(parseInt(x.style["grid-row-end"]) - 1);
        return res;
      });
      let nCol = getComputedStyle(document.getElementsByClassName("container")[0])[
        "gridTemplateColumns"
      ].split(" ").length;
      let records = new Array(nCol).fill(0);
      pos.forEach((pos) => {
        let cst = pos[0];
        let clen = pos[1] - pos[0];
        let rlen = pos[3];
        for (let i = 0; i < clen; i++) {
          records[i + cst] = Math.max(rlen, records[i + cst]);
        }
      });
      let min = records[0];
      let max = min;
      let minPos = 0;
      for (let i = 0; i < records.length; i++) {
        if (records[i] < min) {
          min = records[i];
          minPos = i;
        }
        if (records[i] > max) {
          max = records[i];
        }
      }
      this.expandGrid(max);
      this.addCard(minPos + 1, minPos + 2, min + 1, min + 2, true);
    },
    addCard(colStart, colEnd, rowStart, rowEnd, type = false) {
      let innerText = "+";
      let cssText =
        "grid-column: " +
        colStart +
        "/" +
        colEnd +
        ";grid-row:" +
        rowStart +
        "/" +
        rowEnd ;
      this.card.push({ text: innerText, style: cssText, add: type, data:[],target: "", setting: false });
    },
    adderOfCard(crd) {
      crd["add"] = false;
      crd["text"] = 0;
      this.newAdder();
    },
  },
  data() {
    return {
      card: [
        { text: "掘金", style: "grid-column : 1 / 2; grid-row : 1 / 3 ", add: false, data: [], target:"/juejin/category/frontend", setting: true},
        { text: "Windows Blog", style: "grid-column : 2 / 4; grid-row : 1 / 4 ", add: false, data: [], target:"https://blogs.windows.com/windows-insider/feed/", setting: false},
        { text: "触乐", style: "grid-column : 4 / 5; grid-row : 1 / 4 ", add: false, data: [], target:"/chuapp/index/daily", setting: false},
      ],
      cols: 4,
      rows: 5,
    };
  },
  mounted() {
    this.newAdder();
    this.card.forEach(x => {
        if(x.add === false){
            this.getRss(x);
        }
    });
  },
  setup() {
    return {};
  },
});
</script>

<style scoped >
.container {
  display: grid;
  grid-template-columns: repeat(v-bind(cols), 24vw);
  grid-template-rows: repeat(v-bind(rows), 100px);
  grid-gap: 1vw;
  margin: 0;
  /*grid-auto-rows: minmax(100px,100px);
  grid-auto-columns: minmax(24vw,24vw);*/
}
.cards {
  display: flex;
  background: #ffffff;
  padding: 28px;
  box-shadow: 0 1.6px 3.6px 0 rgb(0 0 0 / 13%),0 0.3px 0.9px 0 rgb(0 0 0 / 11%);
}
a:link {
    text-decoration: none;
    /*color: rgb(0,120,212);*/
    color: black;
}
a:visited {
    text-decoration: none;
    /*color: rgb(0,120,212);*/
    color: grey;
}
</style>
