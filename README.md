# ES Module - 浏览器原生模块支持

## 前言

JavaScript本来只是用来在网页中执行简单的脚本功能，然而历史的进程将JavaScript推上了更大的舞台，编写复杂的大型应用，需要一种能将JavaScript程序拆分为可单独导入的模块机制，Node.js为此提供了CommonJS，即使CommonJS依然存在不足，但是瑕不掩瑜，在Node.js服务端的开发中，它依然大放异彩，可惜的是，在客户端（泛指浏览器）却迟迟没有诞生合适的模块功能，开发者凭借自身的聪明才智制定了CMD与AMD规范，并创造了sea.js和require.js两种规范的实现，然而类库始终是类库，并非完美的解决方案，面对多种规范并存的现象，开发者迫切的希望能有一种前后端通用的模块机制，终于浏览器原生提供了模块功能，它使得JavaScript更为完整

## 模块关键字

对于初学者，网上大量的教材或资料其实依然采用了CommonJS模块机制，因此有不少人在最初的阶段会存在困惑，弄不清楚几个关键字的用法，甚至二者发生混淆（不考虑其他模块规范）

### CommonJS

```javascript
// 导出
// a.js 假设仅需导出一个模块（a函数）
module.exports = function a() { 
    // do something 
}
// 引入
const a = require('./a.js')


// b.js 假设需要导出多个模块
exports.a = function a () { 
    // do something 
}
exports.b = function b () { 
    // do something 
} 
...
// 引入
const {a, b} = require('./b.js')
```

初学者最常见的困惑是`module.exports`与`exports`之间的关系，其实这是Node.js在包装模块输出时提供的额外变量，其实本质上将相当于`var exports = module.exports`

但是伴随而来的是更大的困惑，为什么`exports`导出模块的方式，是以对象赋予属性的方式，而不是直接赋值导出，厘清这一问题的关键在于，明白变量的赋值行为的含义，JS基础扎实的开发者，很轻易就会发现，此种做法将改写变量，从而偏离Node.js预设的逻辑，在最终模块导出时，出现差错

### ESMudule

```javascript
// 导出
// c.js 假设仅需导出一个模块（c函数）
export default function c () { 
    // do something 
}
// 引入 
import customName from "./c.js"

// d.js 假设需要导出多个模块
export function d () {
    // do something 
}
export function e () {
    // do something 
}

// 引入 
// 知晓确切的函数名称 方可引入
import {d,e} from "./d.js" 
// 通过 * 号使模块整体导出
import * as m from "./d.js"
```

如果是采用了`export default`输出的模块，开发者引用模块时可以自定义模块名，而通过`export`导出的模块，你必须知晓其确切的函数名称才可以完成引入，在某种程度上这很麻烦，但也可以通过`* as moduleName`的方式，将所有`export`模块的内容组合成一个对象进行返回

区别

可以看到ESmodule的导出行为有些特别，它比CommonJS的导出更为简洁，性能更加的优异，这是为什么，其本质的原因就是二者的执行阶段与方式有所不同

CommonJS是在发现`require`关键字引用模块时，便会运行整个模块的代码，取到值并进行缓存，从那之后`require`的再次引用只需在缓存中取值即可，这就变成了运行一次，往后只需在缓存中取值（当然，缓存也是会更新的）

那么问题来了：

假设该模块文件下一共导出了10个模块，而在实际开发中，我们仅仅用到其中一个模块，这就造成了引用浪费，将多余的代码塞进缓存却不使用，这就造成了内存空间浪费

ESModule则采用了动态只读引用的方式加载模块代码，`import`作为只读的关键字，在发现引用时，就会生成一个只读引用，等待脚本执行的阶段，根据该引用前往加载模块中取值，而这便是动态引用，即取即用，并且该过程是**异步的**

异步的模块加载机制是非常重要的，在浏览器中，是无法承受同步加载模块的代价，一旦某个模块出现问题，会导致网页白屏迟迟无法渲染，又或是模块过于庞大，导致网页加载延迟，在重视用户体验的客户端会造成灾难性的后果

## 浏览器原生支持模块

截止笔者撰写文章，主流浏览器已基本兼容原生模块

![aCa4A0.png](https://s1.ax1x.com/2020/07/26/aCa4A0.png)

那么如何在浏览器中直接使用模块机制，答案是通过`<script type="module">`标识告知浏览器将启用原生模块机制，若是普通的`script`标签将报错

创建项目，注：文章代码引自[MDN提供的示例](https://github.com/mdn/js-examples/tree/master/modules)，并稍做修改，可前往查看

项目结构目录

```
index.html
index.js
main.js
modules/
    canvas.mjs
    square.mjs
```

注意事项

1、原生模块引用无法通过本地测试，需要开启本地服务器加载页面

2、原生模块引用必须设置正确的`MIME-type`，这非常重要，否则浏览器将无法正确加载模块，常见报错为:`The server responded with a non-JavaScript MIME type`

模块导出

```javascript
// modules/canvas.js
function create(id, parent, width, height) {
  let divWrapper = document.createElement('div');
  let canvasElem = document.createElement('canvas');
  parent.appendChild(divWrapper);
  divWrapper.appendChild(canvasElem);

  divWrapper.id = id;
  canvasElem.width = width;
  canvasElem.height = height;

  let ctx = canvasElem.getContext('2d');

  return {
    ctx: ctx,
    id: id
  };
}

function createReportList(wrapperId) {
  let list = document.createElement('ul');
  list.id = wrapperId + '-reporter';

  let canvasWrapper = document.getElementById(wrapperId);
  canvasWrapper.appendChild(list);

  return list.id;
}

export { create, createReportList };
```

```javascript
// modules/square.js
const name = 'square';

function draw(ctx, length, x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, length, length);

  return {
    length: length,
    x: x,
    y: y,
    color: color
  };
}

function random(min, max) {
   let num = Math.floor(Math.random() * (max - min)) + min;
   return num;
}

function reportArea(length, listId) {
  let listItem = document.createElement('li');
  listItem.textContent = `${name} area is ${length * length}px squared.`

  let list = document.getElementById(listId);
  list.appendChild(listItem);
}

function reportPerimeter(length, listId) {
  let listItem = document.createElement('li');
  listItem.textContent = `${name} perimeter is ${length * 4}px.`

  let list = document.getElementById(listId);
  list.appendChild(listItem);
}

function randomSquare(ctx) {
  let color1 = random(0, 255);
  let color2 = random(0, 255);
  let color3 = random(0, 255);
  let color = `rgb(${color1},${color2},${color3})`
  ctx.fillStyle = color;

  let x = random(0, 480);
  let y = random(0, 320);
  let length = random(10, 100);
  ctx.fillRect(x, y, length, length);

  return {
    length: length,
    x: x,
    y: y,
    color: color
  };
}

export { name, draw, reportArea, reportPerimeter };
export default randomSquare;
```

模块引入

```javascript
// main.js
import { create, createReportList } from './modules/canvas.js';
import { name, draw, reportArea, reportPerimeter } from './modules/square.js';
import randomSquare from './modules/square.js';

let myCanvas = create('myCanvas', document.body, 480, 320);
let reportList = createReportList(myCanvas.id);

let square1 = draw(myCanvas.ctx, 50, 50, 100, 'blue');
reportArea(square1.length, reportList);
reportPerimeter(square1.length, reportList);

// Use the default
let square2 = randomSquare(myCanvas.ctx);

```

页面加载

```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <meta charset="utf-8">
    <title>Basic JavaScript module example</title>
    <style>
      canvas {
        border: 1px solid black;
      }
    </style>
    <script type="module" src="main.js"></script>
  </head>
  <body>
    Basic JavaScript module example 
  </body>
</html>
```

服务端代码

```javascript
//index.js
const http = require('http')
const fs = require('fs')
const url = require('url')
const path = require('path')
const mime = require('mime')

http.createServer(function(request,response) {
    const urlObj = url.parse(request.url)
    const urlPathname  = urlObj.pathname
    const filename = path.join(__dirname, urlPathname)
    const ext = path.parse(urlPathname).ext
    const mimeType = mime.getType(ext) || ""
    
    if(mimeType) {
        fs.readFile(filename, (err, data) => {
            console.log("mimeType:"+mimeType)
            if(err) {
                response.writeHead(404, { "Content-Type": "text/plain" });
                response.write("404 - File is not found!")
                response.end()
            }else{
                response.writeHead(200, { "Content-Type": mimeType});
                response.end(data)
            }
        })
    }else{
        const html = fs.readFileSync("./index.html",'utf-8')
        response.end(html)
    }
    
}).listen(8080,() => {
    console.log('server id dev')
})
```

启动服务

```javascript
node index.js
```

[源码clone直接运行]()

## 结尾

最近有留意到[vite]()的同学应该知道，实际上vite就是开发过程中没有打包，直接将ES模块源码输出给浏览器，使用浏览器自带的`<script module>`原生支持，通过每次HTTP请求进行import,开发服务器会直接拦截请求完成代码转换，例如.vue文件的请求，会拿来进行相关转换，最终输出为浏览器可接受的资源，这相比较于Webpack在启动和热更新的效率，提升了数十倍，在[【Web前端会客厅】Vue之父尤雨溪深度解读Vue3.0的开发思路](https://www.bilibili.com/video/BV1qC4y18721?t=1492)视频中有讲到，按照小右的说法，秒开！