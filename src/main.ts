import ArcoVue, { Message } from "@arco-design/web-vue";
import "@arco-design/web-vue/dist/arco.css";
import ArcoVueIcon from "@arco-design/web-vue/es/icon";
import { createApp } from "vue";
import App from "./App.vue";
// @ts-ignore
import TimeAgo from "vue-timeago3";
// @ts-ignore
import enUS from "date-fns/locale/en-US";
// @ts-ignore
import zhCN from "date-fns/locale/zh-CN";
import "focusany-sdk/shim";
import "./style.less";

const app = createApp(App);
Message._context = app._context;
app.use(ArcoVue);
app.use(ArcoVueIcon);

app.use(TimeAgo, {
    name: "TimeAgo",
    locale: zhCN,
    locales: {
        "en-US": enUS,
        "zh-CN": zhCN
    }
});

app.mount("#app");
