const Fs=require("fire-fs"),Path=require("fire-path");Editor.require("packages://cc-inspector/plugin/CCInspectorPluginMsg.js");const CCInspectorPluginMsg=window.CCInspectorPluginMsg,PluginMsg=Editor.require("packages://cc-inspector/core/PluginMsg.js");Editor.require("packages://cc-inspector/panel/item.js")(),Editor.Panel.extend({style:Fs.readFileSync(Editor.url("packages://cc-inspector/panel/index.css"),"utf-8"),template:Fs.readFileSync(Editor.url("packages://cc-inspector/panel/index.html"),"utf-8"),$:{},ready(){this.plugin=new window.Vue({el:this.shadowRoot,created(){this.treeData=[],this.onLaunchDebugServer();const e=Editor.require("packages://cc-inspector/core/PluginMsg.js");this.$root.$on(e.MsgInside.GetNodeInfo,function(e){e&&e.uuid&&this.webSocket.send(JSON.stringify({code:CCInspectorPluginMsg.Msg.GetNodeInfo,data:e.uuid}))}.bind(this))},init(){},data:{test:"",webSocket:null,treeData:[{name:"test1",folded:!1,position:cc.v2(100,100),anchor:cc.v2(0,0),size:cc.size(200,200),rotation:0,opacity:255,color:{r:200,g:100,b:34,a:255},skew:cc.v2(3,3),children:[{name:"children1",folded:!1,children:[{name:"children66",folded:!1},{name:"children66",folded:!1}]},{name:"children2",folded:!1},{name:"children3",folded:!1}]},{name:"test2",folded:!1,id:"11",x:1,y:2}],foldedCache:{},bulbColor:"#bfbfbf",bulbClass:""},watch:{treeData(e){}},methods:{getBulbColor(){let e="d4237a";return e=this.webSocket?"#1afa29":"#d4237a"},onBtnClickTest(){if(this.webSocket)this.webSocket.send(JSON.stringify({code:CCInspectorPluginMsg.Msg.GetTreeInfo,data:null}));else Editor.Dialog.messageBox({type:"warning",title:"提示",buttons:["确定"],message:"未发现有正在运行的游戏,请运行游戏后重试!",defaultId:0,cancelId:1,noLink:!0})},onBtnClickTestData(){this.onLaunchDebugServer()},onBtnClickOpenPreviewWeb(){Editor.Panel.open("cc-inspector.preview-web")},onBtnClickOpenTreeInfo(){Editor.Panel.open("cc-inspector.info")},_updateTreeInfo(){},onMsg(e){let t=JSON.parse(e),i=t.code,n=t.data;if(i===CCInspectorPluginMsg.Msg.GetTreeInfo){let e=[];for(let t=0;t<n.length;t++){let i=n[t];this.serialize(i,e)}this.treeData=e,Editor.Ipc.sendToPanel("cc-inspector.info","resetPanel")}else if(i===CCInspectorPluginMsg.Msg.GetNodeInfo){let e=this.serializeData(n);Editor.Ipc.sendToPanel("cc-inspector.info","onReceiveNodeInfo",e)}},_getPreIsFolded:e=>!0,serialize(e,t){let i=this.serializeData(e);for(let t=0;t<e.children.length;t++){let n=e.children[t];this.serialize(n,i.children)}t.push(i)},serializeComp(e){},serializeData(e){return{folded:this._getPreIsFolded(e.uuid),selected:!1,uuid:e.uuid,name:e.name,active:e.active,anchor:cc.v2(e.anchorX||0,e.anchorY||0),size:cc.size(e.width||0,e.height||0),position:cc.v2(e.x||0,e.y||0),scale:cc.v2(e.scaleX||0,e.scaleY||0),skew:cc.v2(e.skewX,e.skewY),opacity:e.opacity,rotation:e.rotation,color:{r:e.color.r,g:e.color.g,b:e.color.b,a:e.color.a},children:[],components:e.components}},_bulbOver(){this.bulbColor="#bfbfbf"},_bulbShake(){this.webSocket?this.bulbColor="#f4ea2a":this.bulbColor="#d4237a",this.bulbClass="bulb",setTimeout(function(){this.bulbColor="#1afa29",this.bulbClass=""}.bind(this),1100)},probe(e,t){let i=require("net").createServer().listen(e);i.on("listening",function(){i.once("close",function(){t(!1,e)}),i.close()}),i.on("error",function(i){t(!0,e)})},_createDebugServer(e){this.wsServer&&this.wsServer.close(function(){});let t=Editor.require("packages://cc-inspector/node_modules/ws");this.wsServer=new t.Server({port:e},function(){Editor.log("[cc-inspector] 插件启动成功: "+e)}),this.wsServer.on("connection",function(e){this._bulbShake(),this.webSocket=e,e.on("message",function(e){this.onMsg(e)}.bind(this)),e.on("close",function(){this.webSocket=null,this.treeData=[],Editor.Ipc.sendToPanel("cc-inspector.info","resetPanel"),this._bulbOver()}.bind(this)),e.on("error",function(){this.webSocket=null,Editor.Ipc.sendToPanel("cc-inspector.info","resetPanel"),this.treeData=[],this._bulbOver()}.bind(this)),e.on("open",function(){}.bind(this))}.bind(this))},_makeDir:async e=>await new Promise(function(t,i){if(Editor.remote.assetdb.exists(e))return t(null),!0;Editor.assetdb.create(e,null,function(e,n){return e?(i(e),!1):(t(n),!0)})}),_createFileWithData:async(e,t)=>await new Promise(function(i,n){Editor.assetdb.createOrSave(e,t,function(e,t){return e?(n(e),!1):(i(t),!0)})}),async _makeDirs(e){if(Editor.remote.assetdb.exists(e))return!0;this._makeDirs(Path.dirname(e))&&await this._makeDir(e);return!0},_onFindPort(e,t){if(e)this.probe(t+1,this._onFindPort.bind(this));else{let e=this._getLocalIp();(async()=>{let i="db://assets/resources/cc-inspector.json",n={host:e,port:t};if(Editor.remote.assetdb.exists(i)){let s=Editor.assetdb.remote.urlToFspath(i),o=Fs.readFileSync(s,"utf-8"),r=JSON.parse(o);r.host=e,r.port=t,n=r}else{let e=Path.dirname(i);await this._makeDirs(e)}await this._createFileWithData(i,JSON.stringify(n)),this._createDebugServer(t)})()}},_getLocalIp(){let e="",t=require("os").networkInterfaces();return Object.keys(t).forEach(function(i){t[i].forEach(function(t){"IPv4"===t.family&&!1===t.internal&&(e=t.address)})}),e.length>0?e:"127.0.0.1"},onLaunchDebugServer(){this.probe(6543,this._onFindPort.bind(this))},updateNodeProperty(e){if(this.webSocket&&e&&void 0!==e.code&&e.data){let t=JSON.stringify(e);this.webSocket.send(t),e.code===CCInspectorPluginMsg.Msg.Active&&this.$root.$emit(PluginMsg.MsgInside.NodeActive,e.data)}}}})},messages:{onChangeProperty(e,t){this.plugin.updateNodeProperty(t)},"build-state-changed"(e,t,i,n,s){},"build-finished"(e,t){}}});