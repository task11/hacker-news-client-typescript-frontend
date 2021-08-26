const ajax = new XMLHttpRequest();
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';

ajax.open('GET', NEWS_URL, false);
ajax.send();

//json 형식이기때문에 객체로 바꾸기 가능
const newsFeed = JSON.parse(ajax.response);

const ul = document.createElement('ul');

for(let i = 0; i < 10; i++){
    const li = document.createElement('li');
    const a = document.createElement('a');

    a.href ='#';
    a.innerHTML = `${newsFeed[i].title}(${newsFeed[i].comments_count})`;
    li.appendChild(a);
    ul.appendChild(li);
}

document.getElementById('root').append(ul);

