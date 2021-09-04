const ajax = new XMLHttpRequest();
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';

function getData(url){
    ajax.open('GET', url, false);
    ajax.send();
    return JSON.parse(ajax.response);
}

//json 형식이기때문에 객체로 바꾸기 가능
const newsFeed = getData(NEWS_URL);
const contatiner = document.getElementById('root');

const ul = document.createElement('ul');
const content = document.createElement('div');

window.addEventListener('hashchange', function(){
    //console.log(location.hash); //id가져오기 (브라우저가 기본으로 제공해주는 객체)
    const id = location.hash.substr(1);

    const newsContent = getData(CONTENT_URL.replace('@id', id));
    const title = document.createElement('h1');

    title.innerHTML = newsContent.title;
    content.appendChild(title);
    console.log(newsContent);
    // ul.innerHTML = `${conTent.content}`;

});


for(let i = 0; i < 10; i++){
    const div = document.createElement('div');

    div.innerHTML = `
        <li>
            <a href = #${newsFeed[i].id}>
                ${newsFeed[i].title}(${newsFeed[i].comments_count})
            </a>
        </li>
    `;
    
    //a.addEventListener('click', function(){})
    ul.appendChild(div.firstElementChild);
}

contatiner.append(ul);
contatiner.append(content);
