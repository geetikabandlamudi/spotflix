
$(document).ready(function() {


    var uploadBtn = document.getElementById("upload-video");
    var uploadPopup = document.querySelector(".upload-popup");
    var closeBtn = uploadPopup.querySelector(".close-btn");

    var featuredVideo = document.getElementById('featured-video');
    var recSection = document.getElementById('recommendation-list');
    var searchBar = document.getElementById('search-bar');
    var searchButton = document.getElementById('search-submit');
    var audioIcon = document.getElementById('microphone-icon');
    var uploadPopUpButton = document.getElementById('upload-popup-button');
    var uploadMessage = document.getElementById('upload-message');
    const fileInput = document.getElementById('fileInput');
    var leftPaneHeading = document.getElementById('left-pane-heading');
    const forkToggle = document.getElementById('fork-toggle');
    const toggleSlider = document.querySelector('.toggle-slider');
    const logoutIcon = document.getElementById('logout-icon')
    
    logoutIcon.addEventListener('click', function() {
      window.location.href = 'login.html'; 
    });
    forkToggle.addEventListener('change', function() {
      if (this.checked) {
        toggleSlider.classList.add('on');
      } else {
        toggleSlider.classList.remove('on');
      }
    });

    featuredVideo.addEventListener('ended', function() {
      console.log('The video has ended.');
      if(toggleSlider.classList.contains("on")) {
        var nextVideo = recSection.querySelector('li:first-child');
        console.log(nextVideo);
        nextVideo.click();
      }
    });



    function createRecommendationDOM(video_list) {

      for(var i=0;i<video_list.length;i++)
      {
          var listViewItem = document.createElement('li');

          var link = document.createElement('a');
          link.data = video_list[i]['video_id'];

          var thumbnail = document.createElement('img');
          thumbnail.src = video_list[i]['thumbnail'];
          thumbnail.alt = 'Thumbnail';
          thumbnail.className = 'thumbnail';

          var livePreview = document.createElement('img');
          livePreview.src = video_list[i]['preview-url'];
          livePreview.alt = 'Live Preview';
          livePreview.className = 'live-preview';
          livePreview.style.display = "none";
          

          var title = document.createElement('p')
          title.innerHTML = toTitleCase(video_list[i]['title']);

          var author = document.createElement('p')
          author.innerHTML = toTitleCase(video_list[i]['author']);
          author.className = 'author-style';

          var dominant_genre = document.createElement('p')
          dominant_genre.innerHTML = video_list[i]['dominant_genre'];
          dominant_genre.style = 'display:none;';
          dominant_genre.className = 'dominant-genre';

          var div = document.createElement('div');
          div.appendChild(title);
          div.appendChild(author);
          div.appendChild(dominant_genre);

          link.appendChild(thumbnail);
          link.appendChild(livePreview);
          link.appendChild(div);
          listViewItem.onclick = function() {
            var genre = this.querySelector('.dominant-genre').innerHTML;
            console.log("Clicked!", this.querySelector('a').data, genre);
            playVideo(this.querySelector('a').data, genre)
              .then(response => response)
              .then(data => {
                var url = JSON.parse(data['data']['body']);
                featuredVideo.src = url['url'];
                console.log(url);
                $("#active-video-desc").text(url['lyrics']);
                featuredVideo.setAttribute('autoplay', '');
                document.body.style.cursor='default';
                $("#featured-title").text(toTitleCase((url['title'])));
                $("#active-playing-song-name").html(url['song_name']);
                $("#active-playing-dominant-genre").html(url['dominant_genre']);
                getRecommendation()
                  .then(response => response)
                  .then(data => {
                    recSection.innerHTML = '';
                    if(data['data']['body'] != undefined){
                      var result = JSON.parse(data['data']['body']);
                      createRecommendationDOM(result['video_list']);
                      leftPaneHeading.innerHTML = 'Recommended Videos';
                    }
                    else {
                      recSection.innerHTML = 'Nothing to show as of now!'
                    }
                    
                  })
                  .catch(error => {
                    console.log("recommendation error", error)
                  });

                  uploadBtn.addEventListener("click", function() {
                    uploadPopup.style.display = "block";
                  });
                
                  // Close popup when close button is clicked
                  closeBtn.addEventListener("click", function() {
                    uploadPopup.style.display = "none";
                  });
              })
              .catch(error => {
                const message = document.getElementById('response');
                document.body.style.cursor='default';
                featuredVideo.src = '';
              });
        }

        listViewItem.addEventListener("mouseenter", function( event ) {   
          let currentLivePreview = event.target.querySelector('.live-preview');
          let currentThumbnail = event.target.querySelector('.thumbnail');
          currentThumbnail.style.display = "none";
          currentLivePreview.style.display = "block"
        });

        listViewItem.addEventListener("mouseleave", function( event ) {   
            let currentLivePreview = event.target.querySelector('.live-preview');
            let currentThumbnail = event.target.querySelector('.thumbnail');
            currentThumbnail.style.display = "block";
            currentLivePreview.style.display = "none"
        });

          listViewItem.appendChild(link);
          recSection.appendChild(listViewItem);
      }
    }
    
    playVideo()
      .then(response => response)
      .then(data => {
        var url = JSON.parse(data['data']['body']);
        document.body.style.cursor='default';
        $("#featured-title").text(toTitleCase((url['title'])));

        console.log(url);
        $("#active-video-desc").text(url['lyrics']);
        $("#active-playing-song-name").html(url['song_name']);
        $("#active-playing-dominant-genre").html(url['dominant_genre']);
        featuredVideo.src = url['url'];
        featuredVideo.setAttribute('autoplay', '');
      })
      .catch(error => {
        const message = document.getElementById('response');
        document.body.style.cursor='default';
        featuredVideo.src = '';
      });

    
    getRecommendation()
      .then(response => response)
      .then(data => {
        recSection.innerHTML = '';
        var result = JSON.parse(data['data']['body']);
        leftPaneHeading.innerHTML = 'Recommended Videos';
        createRecommendationDOM(result['video_list']);
      })
      .catch(error => {
        console.log("recommendation error", error)
      });

      uploadBtn.addEventListener("click", function() {
        uploadPopup.style.display = "block";
      });
    
      // Close popup when close button is clicked
      closeBtn.addEventListener("click", function() {
        uploadPopup.style.display = "none";
      });


    uploadPopUpButton.addEventListener('click', function()  {
      
      var reader = new FileReader();
      reader.onload = function (event) {
        var file = fileInput.files[0];
        const imageData = btoa(event.target.result);
        console.log(file);
        if(file === undefined) {
          return;
        }
        else {
        callUploadVideo(imageData, file)
          .then(response => response)
          .then(data => {
            uploadMessage.innerHTML = 'Done!';
            uploadPopup.style.display = "none";
          })
          .catch(error => {
            uploadMessage.innerHTML = 'Oops, error!';
            uploadPopup.style.display = "none";
          });
        }
      };
      if( fileInput.files[0] !== undefined) 
        reader.readAsBinaryString(fileInput.files[0]);
    }, false);


    searchButton.addEventListener('click', function(event) {
      var searchText = searchBar.value;
      callSearch(searchText)
        .then(response => response)
        .then(data => {
          recSection.innerHTML = '';
          var result = JSON.parse(data['data']['body']);
          leftPaneHeading.innerHTML = 'Search Results';
          createRecommendationDOM(result['video_list']);
        })
        .catch(error => {
          console.log("Error in search");
          console.log(error);
        });
    });

      
    /* ----------------------------------- VOICE RECOGNITION --------------------------- */
    const recognition = new webkitSpeechRecognition() || new SpeechRecognition();
    recognition.continuous = true;
    
    recognition.onresult = function(event) {
      const transcript = event.results[0][0].transcript;
      searchBar.value = transcript;
    };
    recognition.onspeechend = function() {
      recognition.stop();
    };

    audioIcon.addEventListener("click", function() {
      recognition.start();
    });



    /* ------------------------------------ API CALLS ------------------------------------- */

    function callUploadVideo(filedata, file) {
        // params, body, additionalParams
        var re = /(?:\.([^.]+))?$/;
        var filename = $('input[type=file]').val().replace(/C:\\fakepath\\/i, '')
        // var ext = re.exec("file.name.with.dots.txt")[1];
        console.log(file.type)
        params = {'filename': filename, 
        'Content-Type': 'base64', 
        'Access-Control-Allow-Origin': '*',
        'x-amz-meta-customLabels-name': $('#uploaded-video-name').val(),
        'x-amz-meta-customLabels-author': $('#uploaded-video-author').val()
      }
      additionalHeaders = {'params': {'x-amz-meta-customLabels-name': $('#uploaded-video-name').val(),
      'x-amz-meta-customLabels-author': $('#uploaded-video-author').val(), 'Content-Type': 'base64'}}
        
        return sdk.uploadPut(params, filedata, additionalHeaders);
      }

    function playVideo(query='', dominant_genre='') {
      params = {'video-id': query, 'dominant_genre': dominant_genre, 'user_id': "546"}
      return sdk.playGet(params, {'video-id': query, 'dominant_genre': dominant_genre, 'user_id': "546"}, {});
    }

    function getRecommendation() {
      params = {'active_song': $('#active-playing-song-name').html(), 
      'active_dominant_genre': $('#active-playing-dominant-genre').html(), "user_id": "546"}
      return sdk.recommendationGet(params, {}, {});
    }

    function callSearch(searched_text) {
      params = {'searched_text': searched_text}
      return sdk.searchGet(params, {}, {});
    }

    function toTitleCase(str) {
      return str.replace(/\w\S*/g, function(txt){
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
  }
})