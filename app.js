const ajax = new XMLHttpRequest();
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json'; // @id 바꿔치키

const container = document.getElementById('root');
const content = document.createElement('div');
//const ul = document.createElement('ul');

let endFlag;

const store = {
    currentPage : 1, // 최근 페이지

}; 


function getData(url){
    ajax.open('GET', url, false);
    ajax.send();
    return JSON.parse(ajax.response);
}


function newsFeed(){
    const newsFeed = getData(NEWS_URL);
    const newsList = [];
    let template = `
        <div class = "container mx-auto p-4">
            <h1>Hacker News</h1>
            <ul>
                {{__news_feed__}}
            </ul>
            <div>
                <a href="#/page/{{__prev_page__}}">이전 페이지</a>
                <a href="#/page/{{__next_page__}}">다음 페이지</a>
            </div>
        </div>
    `; // tailwind css 적용

    for(let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++){
        //const div = document.createElement('div');
        

        newsList.push(`
            <li>
                <a href = #/show/${newsFeed[i].id}>
                    ${newsFeed[i].title}(${newsFeed[i].comments_count})
                </a>
            </li>
        `);
    }

    template = template.replace('{{__news_feed__}}', newsList.join('')); //container.innerHTML = newsList.join(''); // 조인 사용시 배열안의 문자열들을 합쳐서 반환해준다, 배열 인덱스 사이의 구분자(default = ,)가 존재하기때문에 없애줘야하는데,, join 함수의 첫번째 파라미터는 구분자를 어떤것을 사용할지 정하는 부분. 그렇기때문에 '' 라는 공백을 넣으면 문자열만을 반환해준다.
    template = template.replace('{{__prev_page__}}', store.currentPage > 1 ? store.currentPage -1 : 1);
    template = template.replace('{{__next_page__}}', store.currentPage + 1);
    
    container.innerHTML = template;
}


function newsDetail(){

    //console.log(location.hash); //id가져오기 (브라우저가 기본으로 제공해주는 객체)
    const id = location.hash.substr(7);
    const newsContent = getData(CONTENT_URL.replace('@id', id));

    container.innerHTML = `
    <h1>${newsContent.title}</h1>

    <div>
        <a href="#/page/${store.currentPage}">목록으로</a>
    </div>
    `;

    // title.innerHTML = newsContent.title;

    // content.appendChild(title);
    // console.log(newsContent);
    // // ul.innerHTML = `${conTent.content}`;

}

function router(){
    const routePath = location.hash; 

    if(routePath === ''){// location 해쉬에 #이 들어오면 빈 값 반환이 되어 조건문이 동작하는 것
        newsFeed();
    } else if (routePath.indexOf('#/page/') >= 0) { // 문자열 값 안에 존재하면 위치정보, 없으면 -1
        store.currentPage = Number(routePath.substr(7));
        newsFeed();
    } else {
        newsDetail();
    }
}

window.addEventListener('hashchange', router);

router();

