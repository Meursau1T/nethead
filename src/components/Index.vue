<template>
  <fast-design-system-provider
    use-defaults
    background-color="#F7F7F7"
    class="card-center"
  >
    <div id="Index" class="container">
      <fast-card
        class="cards"
        v-bind:key="crd.text"
        v-for="crd in card"
        :style="crd.style"
      >
        <div
          v-if="crd.add"
          @click="adderOfCard(crd)"
          style="height: -webkit-fill-available"
        >
          <div class="card-center">
            <i class="pi pi-plus" />
          </div>
        </div>
        <div v-else>
          <div class="bar-stretch">
            <h2 style="display: inline">{{ crd.text }}</h2>
            <i class="pi pi-cog" @click="changeSetting(crd)"></i>
          </div>
          <div v-if="crd.setting">
            <div class="card-center" style="margin: 3px">
              <fast-text-field
                type="text"
                name="resize"
                label="resize"
                ref="inputSize"
                :placeholder="'Grid位置: '+getArea(crd)"
                style="margin-right: 10px"
              />
              <i class="pi pi-check" @click="changeSize($event, crd)" />
            </div>
            <div class="card-center" style="margin: 3px">
              <fast-text-field
                type="text"
                name="title"
                :placeholder="'标题: '+crd.text"
                ref="inputTitle"
                style="margin-right: 10px"
              />
              <i class="pi pi-check" @click="rename($event,crd)" />
            </div>
            <div class="card-center" style="margin: 3px">
              <fast-text-field
                type="text"
                name="target"
                :placeholder="'Rss: ' + crd.target"
                ref="inputTarget"
                style="margin-right: 10px"
              />
              <i class="pi pi-check" @click="changeRss($event, crd)" />
            </div>
          </div>
          <div v-else>
            <div  class="card-center" v-if="crd.data.length === 0 && crd.target.length != 0">
              <fast-progress-ring/>
            </div>
            <div v-for="pair in crd.data" v-bind:key="pair.title" align="left" style="margin: 10px 0 10px 0;">
              <a :href="pair['link']">{{ pair["title"] }}</a>
            </div>
          </div>
        </div>
      </fast-card>
    </div>
  </fast-design-system-provider>
</template>

<script>
import { defineComponent } from "vue";
import axios from "axios";

export default defineComponent({
  name: "Index",
  props: {},
  components: {},
  methods: {
    expandGrid(max) {
      this.rows = max + 2;
    },
    rename(event, crd) {
      let inputStr = this.$refs.inputTitle.value;
      crd.text = inputStr;
    },
    changeRss(event, crd) {
      let inputStr = this.$refs.inputTarget.value;
      crd.target = inputStr;
      this.getRss(crd);
    },
    changeSetting(card) {
      card.setting = !card.setting;
    },
    getRss(crd) {
      axios
        .get("/rss", {
          params: {
            target: crd.target,
          },
        })
        .then((res) => {
          crd.data = res["data"];
        });
    },
    getArea(card) {
      return card.style.match(/\d+/g);
    },
    changeSize(event, card) {
      let inputStr = this.$refs.inputSize.value;
      console.log(inputStr);
      let gridArea = inputStr.split(" ").map((x) => parseInt(x));
      card["style"] =
        "grid-column : " +
        gridArea[0] +
        " / " +
        gridArea[1] +
        "; grid-row : " +
        gridArea[2] +
        " / " +
        gridArea[3] +
        " ";
      this.expandGrid(gridArea[3]);
      /*
        刷新新建卡片，防止调整尺寸后覆盖
      */
      this.card.pop();
      this.newAdder();
    },
    newAdder() {
      let pos = this.card.map((x) => {
        return x["style"].match(/\d/g).map(x => parseInt(x)-1);
      });
      let records = new Array(this.cols).fill(0);
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
        rowEnd;
      this.card.push({
        text: innerText,
        style: cssText,
        add: type,
        data: [],
        target: "",
        setting: false,
      });
    },
    adderOfCard(crd) {
      crd["add"] = false;
      crd["text"] = "New Card";
      this.newAdder();
    },
  },
  data() {
    return {
      card: [
        {
          text: "掘金",
          style: "grid-column : 1 / 2; grid-row : 1 / 2 ",
          add: false,
          data: [],
          target: "/juejin/category/frontend",
          setting: false,
        },
        {
          text: "Windows Blog",
          style: "grid-column : 2 / 4; grid-row : 1 / 2 ",
          add: false,
          data: [],
          target: "https://blogs.windows.com/windows-insider/feed/",
          setting: false,
        },
        {
          text: "触乐",
          style: "grid-column : 4 / 5; grid-row : 1 / 2 ",
          add: false,
          data: [],
          target: "/chuapp/index/daily",
          setting: false,
        },
      ],
      cols: 4,
      rows: 5,
      dialogVisible: false,
    };
  },
  mounted() {
    this.newAdder();
    this.card.forEach((x) => {
      if (x.add === false) {
        this.getRss(x);
      }
    });
  },
  setup() {
    return {};
  },
});
</script>

<style scoped>
.container {
  display: grid;
  grid-template-columns: repeat(v-bind(cols), 23vw);
  grid-template-rows: repeat(v-bind(rows), 260px);
  grid-auto-columns: minmax(23vw, 23vw);
  grid-auto-rows: minmax(300px, 320px);
  grid-gap: 1vw;
}

.cards {
  padding: 28px;
  overflow: auto;
}
.bar-stretch {
  display: flex;
  justify-content: space-between;
}
.card-center {
  height: -webkit-fill-available;
  display: flex;
  justify-content: center;
  align-items: center;
}
a:link {
  text-decoration: none;
  color: black;
}
a:visited {
  text-decoration: none;
  color: grey;
}
.pi {
  filter: contrast(1.4);
}
</style>
