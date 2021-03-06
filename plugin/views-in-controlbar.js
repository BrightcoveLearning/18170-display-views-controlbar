videojs.registerPlugin('viewsInControlbar', function () {
  var myPlayer = this,
      viewsObject = [];

  // Build options needed for Analytics API request
  var options = {},
      baseURL = "https://analytics.api.brightcove.com/v1/alltime/accounts/";
  options.proxyURL = "https://solutions.brightcove.com/bcls/bcls-proxy/brightcove-learning-proxy-v2.php";
  options.requestType = "GET";

  // Wait for loadstart event so mediainfo is populated
  // and the video ID and account ID can be retrieved
  myPlayer.on('loadstart', function() {
    // +++ Setup for video views Analytics API request +++
    var videoID = myPlayer.mediainfo.id,
      accountID = myPlayer.mediainfo.accountId;

    // set up data for Analytics API request
    options.url = baseURL + accountID + '/videos/' + videoID;

    // +++ Make the request to the Analytics API +++
    // Extract views from data returned by Analytics API
    makeRequest(options, function(viewsRaw) {
      // Convert response string into JSON
      JSONviewsObject = JSON.parse(viewsRaw);
      var viewsCount;
      console.log('options', options);
      console.log('viewsRaw', viewsRaw);
      console.log('viewsObject', viewsObject);
      viewsCount = JSONviewsObject.alltime_video_views;
      console.log('views', viewsCount);
      // Call function to place data in controlbar
      placeCountInControlbar(viewsCount);
    });

    // +++ Make the Analytics API request +++
    /**
    * send API request to the proxy
    * @param  {Object} options for the request
    * @param  {String} options.url the full API request URL
    * @param  {String="GET","POST","PATCH","PUT","DELETE"} requestData [options.requestType="GET"] HTTP type for the request
    * @param  {String} options.proxyURL proxyURL to send the request to
    * @param  {String} options.client_id client id for the account (default is in the proxy)
    * @param  {String} options.client_secret client secret for the account (default is in the proxy)
    * @param  {JSON} [options.requestBody] Data to be sent in the request body in the form of a JSON string
    * @param  {Function} [callback] callback function that will process the response
    */
    function makeRequest(options, callback) {
      var httpRequest = new XMLHttpRequest(),
          response,
          requestParams,
          dataString,
          proxyURL = options.proxyURL,
          // response handler
          getResponse = function() {
            try {
              if (httpRequest.readyState === 4) {
                if (httpRequest.status >= 200 && httpRequest.status < 300) {
                  response = httpRequest.responseText;
                  // some API requests return '{null}' for empty responses - breaks JSON.parse
                  if (response === "{null}") {
                    response = null;
                  }
                  // return the response
                  callback(response);
                } else {
                  alert(
                    "There was a problem with the request. Request returned " +
                    httpRequest.status
                  );
                }
              }
            } catch (e) {
              alert("Caught Exception: " + e);
            }
          };
       /**
        * set up request data
        * the proxy used here takes the following request body:
        * JSON.strinify(options)
        */
      // set response handler
      httpRequest.onreadystatechange = getResponse;
      // open the request
      httpRequest.open("POST", proxyURL);
      // set headers if there is a set header line, remove it
      // open and send request
      httpRequest.send(JSON.stringify(options));
    }

    // +++ Build and place count in controlbar +++
    /**
     * Dynamically build a div that is then
     * placed in the controlbar's spacer element
     */
    function placeCountInControlbar(viewsCount) {
      var spacer,
        newElement = document.createElement('div');
      //Place data in div
      newElement.innerHTML = "Total Views: " + viewsCount;
      //Get the spacer in the controlbar
      spacer = document.getElementsByClassName('vjs-spacer')[0];
      //Right justify content in the spacer and add top margin
      spacer.setAttribute('style', 'justify-content: flex-end; margin-top: 10px');
      //Add the dynacmially built div to the spacer in the controlbar
      spacer.appendChild(newElement);
    }

  });
}
