const ajax = new XMLHttpRequest();
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';

ajax.open('GET', NEWS_URL, false);
ajax.send();

//json 형식이기때문에 객체로 바꾸기 가능
const newsFeed = JSON.parse(ajax.response);

const ul = document.createElement('ul');
const content = document.createElement('div');
window.addEventListener('hashchange', function(){
    //console.log(location.hash); //id가져오기 (브라우저가 기본으로 제공해주는 객체)
    const id = location.hash.substr(1);
    ajax.open('GET', CONTENT_URL.replace('@id', id), false);
    ajax.send();

    // const newsContent = JSON.parse(ajax.response)
    // const title = document.createElement('h1');

    content.appendChild(title);
    console.log(newsContent);
    // ul.innerHTML = `${conTent.content}`;

});


for(let i = 0; i < 10; i++){
    const li = document.createElement('li');
    const a = document.createElement('a');

    a.href =`#${newsFeed[i].id}`;
    a.innerHTML = `${newsFeed[i].title}(${newsFeed[i].comments_count})`;

    //a.addEventListener('click', function(){})
    li.appendChild(a);
    ul.appendChild(li);
}



document.getElementById('root').append(ul);

