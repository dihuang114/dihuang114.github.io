var posts=["/declare/","/download/","2025/06/11/test/","/mustsee/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };