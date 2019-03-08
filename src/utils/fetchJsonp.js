const defaultOptions = {
  timeout: 5000,
  jsonpCallback: 'callback',
  jsonpCallbackFunction: null
};

function generateCallbackFunction() {
  return `jsonp_${Date.now()}_${Math.ceil(Math.random() * 100000)}`;
}

function clearFunction(functionName) {
  // IE8 throws an exception when you try to delete a property on window
  // http://stackoverflow.com/a/1824228/751089
  try {
    delete window[functionName];
  } catch (e) {
    window[functionName] = undefined;
  }
}

function removeScript(scriptId) {
  const script = document.getElementById(scriptId);
  if (script) {
    document.getElementsByTagName('head')[0].removeChild(script);
  }
}
const xhrArray=[];
window.onerror=function (e) {
  //当清除掉jsonp的回调函数之后，jsonp执行完毕，返回数据会报错，
  //console.log(e);
  //return true;
}

function checkXhr(xhr) {
  for (let i=0;i<xhrArray.length;i++) {
    let xhrTemp=xhrArray[i];
    if(xhr.url===xhrTemp.url) {
      //判断两者时间间隔,如果上一次请求还没有超时，则abort掉上一次请求
      let oldTime=xhrTemp.time;
      let newTime=xhr.time;
      if(newTime-oldTime<xhrTemp.timeout) {
        xhrTemp.jsonpScript.onerror('abort');
        xhrArray.splice(i, 1);
        i--;
      }
    }
  }
}
function fetchJsonp(_url, data={}, options = { jsonpCallback:'_cb',
  timeout: 20000 }) {
  // to avoid param reassign
  let url = _url;

  let dataStr = ''; //数据拼接字符串
  Object.keys(data).forEach(key => {
    dataStr += key + '=' + data[key] + '&';
  })
  if (dataStr !== '') {
    dataStr = dataStr.substr(0, dataStr.lastIndexOf('&'));
    url = url + '?' + dataStr;
  }

  let urlId=url;//确定唯一值url

  url += (url.indexOf('?') === -1) ? '?' : '&';
  let requestTime=new Date().getTime()
  url+='_='+requestTime;

  const timeout = options.timeout || defaultOptions.timeout;
  const jsonpCallback = options.jsonpCallback || defaultOptions.jsonpCallback;

  let timeoutId;
  let responseData=null;//保存返回内容
  let originalCallback=null;

  return new Promise((resolve, reject) => {
    const callbackFunction = options.jsonpCallbackFunction || generateCallbackFunction();
    const scriptId = `${jsonpCallback}_${callbackFunction}`;

    window[callbackFunction] = (response) => {
      responseData=response;
      //清除数据
      if (timeoutId) clearTimeout(timeoutId);

      removeScript(scriptId);
      clearFunction(callbackFunction);

      originalCallback=undefined;
    };
    originalCallback=window[callbackFunction];

    // Check if the user set their own params, and if not add a ? to start a list of params
    url += (url.indexOf('?') === -1) ? '?' : '&';

    const jsonpScript = document.createElement('script');
    jsonpScript.setAttribute('src', `${url}${jsonpCallback}=${callbackFunction}`);
    if (options.charset) {
      jsonpScript.setAttribute('charset', options.charset);
    }
    jsonpScript.id = scriptId;

    let newXhr={ url:urlId, time:requestTime, jsonpScript:jsonpScript, timeout:timeout }
    checkXhr(newXhr);//检查此处请求是否已经存在，存在的话，就将其删除

    document.getElementsByTagName('head')[0].appendChild(jsonpScript);//将脚本加入页面，执行请求

    timeoutId = setTimeout(() => {
      reject(new Error(`JSONP request to ${_url} timed out`));

      clearFunction(callbackFunction);
      removeScript(scriptId);
    }, timeout);

    //脚本加载成功后执行回调
    jsonpScript.onload=function () {
      resolve({
        ok: true,
        // keep consistent with fetch API
        json: () => {
          xhrArray.length=0;//清空数组
          return Promise.resolve(responseData)
        }
      });

      if (timeoutId) clearTimeout(timeoutId);

      removeScript(scriptId);
      clearFunction(callbackFunction);

      originalCallback=undefined;//清除数据
    }
    // Caught if got 404/500，或者手动abort
    jsonpScript.onerror = (errorType) => {
      if(errorType==='abort') {
        reject(new Error('request abort'));
      }else {
        reject(new Error(`JSONP request to ${_url} failed`));
      }
      clearFunction(callbackFunction);
      window[callbackFunction]=originalCallback;
      removeScript(scriptId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  });
}

// export as global function
/*
 let local;
 if (typeof global !== 'undefined') {
 local = global;
 } else if (typeof self !== 'undefined') {
 local = self;
 } else {
 try {
 local = Function('return this')();
 } catch (e) {
 throw new Error('polyfill failed because global object is unavailable in this environment');
 }
 }
 local.fetchJsonp = fetchJsonp;
 */

export default fetchJsonp;
