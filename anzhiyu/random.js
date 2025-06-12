var posts=["/declare/","/mustsee/","/download/","2025/06/11/test/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };