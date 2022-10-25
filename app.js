// ==UserScript==
// @name         Auto reservation parkin
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Script for parkin reservation
// @author       Paul
// @match        https://park-in.kb.cz/
// @updateURL    https://pavelhynek.github.io/park-in/app.js
// @downloadURL  https://pavelhynek.github.io/park-in/app.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=kb.cz
// @grant        GM_log
// ==/UserScript==

setTimeout(() => {
    const cards = [...document.getElementsByClassName("card")];
    let dates = [];
    if(localStorage.dates){
         dates = JSON.parse(localStorage.dates);
    };

    cards.forEach(card => {
        const cardBody = card.querySelector('.card-body');
        const statusString = cardBody.querySelector('small').innerText;
        const cardDate = cardBody.querySelector('div.kb-primary-text-color').innerText;

        // Check if its occupied
        if(statusString == 'obsazeno') {
            // Create checkbox
            const div = document.createElement('div');
            div.className = 'js-auto card-body';
            div.innerHTML = `<input type="checkbox" id="${cardDate}" name="${cardDate}" class="mr-2"><label for="${cardDate}" class="mb-0">Autorezervovat</label>`;
            if(dates.length >= 1) {
            dates.forEach(date => {
                if(cardDate === date) {
                    div.innerHTML = `<input type="checkbox" checked id="${cardDate}" name="${cardDate}" class="mr-2"><label for="${cardDate}" class="mb-0">Autorezervovat</label>`;
                }

            });
            }
            card.appendChild(div);
            const checkbox = div.querySelector('.js-auto input');
            checkbox.addEventListener('change', () => {
                if(checkbox.checked) {
                    GM_log("Adding: "+cardDate);
                    dates.push(cardDate);
                    localStorage.setItem('dates', JSON.stringify(dates));
                } else {
                    GM_log("Removing: "+cardDate);
                    const index = dates.findIndex((date) => date === cardDate);
                    dates.splice(index, 1)
                    localStorage.setItem('dates', JSON.stringify(dates));
                };
            });
        };

        dates.forEach(date => {
            if(cardDate === date) {
                if(statusString == 'obsazeno') {
                    // set allert box
                    GM_log(date+' je obsazeno! Za 5min pokus opakuji.');
                    setTimeout(function(){
                        window.location.reload();
                    },300000)
                };
                if(statusString == 'volné místo') {
                    // set succes box
                    // click to reservation
                    const btns = [...cardBody.getElementsByClassName('btn')];
                    btns.forEach(btn => {
                        if(btn.innerText == 'rezervovat') {
                            btn.click();
                            const btns2 = [...cardBody.getElementsByClassName('btn')];
                            btns2.forEach(btn2 => {
                                if(btn2.innerText == 'rezervovat') {
                                    btn2.click();
                                }
                            });
                        }
                    });
                    GM_log('Úspěšně rezervuji: '+date)
                    const index = dates.findIndex((date) => date === cardDate);
                    dates.splice(index, 1)
                    localStorage.setItem('dates', JSON.stringify(dates));
                };
            };
        });

    });
}, 2000);
