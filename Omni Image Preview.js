// ==UserScript==
// @name         Omni Image Preview
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  https://greasyfork.org/ru/scripts/487845-omni-image-preview
// @author       I AM CHILLING
// @match        https://omni.top-academy.ru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=top-academy.ru
// @grant        none
// ==/UserScript==

var CurrentHomeworks=null;

function SendPacket(URL, Type, JSONVals){
    return new Promise((resolve, reject) => {

        const xhr = new XMLHttpRequest();
        xhr.open(Type, URL);
        xhr.setRequestHeader('authority', 'msapi.top-academy.ru');
        xhr.setRequestHeader('method', 'POST');
        xhr.setRequestHeader('path', '/api/v2/auth/login');
        xhr.setRequestHeader('scheme', 'https');
        xhr.setRequestHeader('Accept', 'application/json, text/plain, */*');
        xhr.setRequestHeader('Accept-Language', 'ru_RU, ru');

        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.responseText);
                } else {
                    reject(xhr.statusText);
                }
            }
        };
        xhr.onerror = () => reject(xhr.statusText);

        if (JSONVals!==null) {
            xhr.setRequestHeader('Content-Type', 'application/json');
            const requestBody = JSON.parse(JSONVals);
            xhr.send(JSON.stringify(requestBody));
        } else {
            xhr.send();
        }

    });

}


function IsHomeWorksOpened(){
    return document.querySelectorAll(".md-dialog-container.home_work_modal").length == 1 // Применить скрипт если окно открылось
}

function ShowImageIfAvaiable(){
        SendPacket("https://omni.top-academy.ru/homework/get-new-homeworks", "POST", null).then(data => {
            data = JSON.parse(data);
            //Скрипт будет работать корректно только если все дз есть в списке
            if (document.querySelectorAll(".hw-md_stud-work__btns-more button").length === 2){
                document.querySelectorAll(".hw-md_stud-work__btns-more button")[1].click()
            }
            var FullscreenView = document.createElement('div');
            FullscreenView.innerHTML=`
            <style>
img#FullscreenImg{
    max-width: 80%;
    max-height: 70%;
    transform: translate(-50%, -50%);
    left: 50%;
    top: 50%;
    position: fixed;
    height: auto;
    border-radius: 20px;
    z-index: 9000;
    display: block;
}

div#FullscreenView {
    width: 100%;
    height: 100%;
    background: #252525de;
    position: absolute;
    top: 1px;
    z-index: 102;
    display: none;
}
</style>
            <div id="FullscreenView" onClick="document.getElementById('FullscreenView').style.display='none'">

            <img id="FullscreenImg" onClick="">
            </div>`;
            document.querySelector("body").after(FullscreenView)

            CurrentHomeworks=data.homework.reverse();
            const downloadUrls = CurrentHomeworks.map(obj => obj.download_url_stud);
            const PreviewPlaces = document.querySelectorAll(".hw-md_single_stud-work__outer")
            for (var i=0; i < (CurrentHomeworks.length - i); i++){
                var ImgPreviewDiv = document.createElement('div');
                ImgPreviewDiv.innerHTML=(`

<img src=`+downloadUrls[i]+` style="border-radius:20px; width:100%; cursor:pointer;" onClick="document.getElementById('FullscreenImg').src='`+downloadUrls[i]+`'; document.getElementById('FullscreenView').style.display='block'">
`);
                PreviewPlaces[i].after(ImgPreviewDiv);
            }

            document.querySelector("body.main.md-dialog-is-showing")


        })
}

function ProcessLoad(){
    if(IsHomeWorksOpened()){
        setTimeout(ShowImageIfAvaiable, 200)
    } else {
        setTimeout(ProcessLoad, 200)
    }
}

(function() {
   ProcessLoad()
})();
