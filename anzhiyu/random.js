var posts=["/declare/","/download/","/mustsee/","2025/06/11/test/","2025/06/13/slaythespire/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };