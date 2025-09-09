
function main() {
    const scriptElem = document.createElement('script');
    scriptElem.src = "https://cdn.bootcss.com/vConsole/3.2.2/vconsole.min.js";
    document.body.appendChild(scriptElem);
    var onLoadSuccess = () => {
        const vConsole = new window.VConsole();
    }
    if (document.all) { //IE
        scriptElem.onreadystatechange = function () {
            if (scriptElem.readyState == 'loaded' || scriptElem.readyState == 'complete') {
                onLoadSuccess();
            }
        }
    } else {
        scriptElem.onload = function () {
            onLoadSuccess();
      }
    }
}

main()