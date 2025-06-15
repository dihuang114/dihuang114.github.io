var posts=["/declare/","/mustsee/","/download/","2025/06/15/pcsoftware/bandizam/","2025/06/15/pcsoftware/bandizip/","2025/06/15/pcsoftware/everything/","2025/06/15/pcsoftware/newpc/","2025/06/15/pcsoftware/snipaste/","2025/06/15/pcsoftware/winrar/","2025/06/13/pcgame/slaythespire/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };