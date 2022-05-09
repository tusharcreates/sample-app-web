//This is the front-end Code.
//Not production level code things needs to modified and changed according to the providers requirements.
//Zoom meeting Library given by ZOOM.

import { ZoomMtg } from "@zoomus/websdk";

console.log("checkSystemRequirements");
//This checks system requiremetns for the ZoomMtg that is specified by the zoom.
console.log(JSON.stringify(ZoomMtg.checkSystemRequirements()));

// it's option if you want to change the WebSDK dependency link resources. setZoomJSLib must be run at first
// if (!china) ZoomMtg.setZoomJSLib('https://source.zoom.us/2.4.0/lib', '/av'); // CDN version default
// else ZoomMtg.setZoomJSLib('https://jssdk.zoomus.cn/2.4.0/lib', '/av'); // china cdn option
// ZoomMtg.setZoomJSLib('http://localhost:9999/node_modules/@zoomus/websdk/dist/lib', '/av'); // Local version default, Angular Project change to use cdn version
ZoomMtg.preLoadWasm();
ZoomMtg.prepareJssdk();

const SDK_KEY = "YOUR_SDK_KEY";
/**
 * NEVER PUT YOUR ACTUAL SDK SECRET IN CLIENT SIDE CODE, THIS IS JUST FOR QUICK PROTOTYPING
 * The below generateSignature should be done server side as not to expose your sdk secret in public
 * You can find an eaxmple in here: https://marketplace.zoom.us/docs/sdk/native-sdks/Web-Client-SDK/tutorial/generate-signature
 */
const SDK_SECRET = "YOUR_SDK_SECRET";

  //Importing the test tool
testTool = window.testTool;

  //Disply system configration
document.getElementById("display_name").value =
  "Local" +
  ZoomMtg.getJSSDKVersion()[0] +
  testTool.detectOS() +
  "#" +
  testTool.getBrowserInfo();

  //This putting meeting number from browser cookies.
document.getElementById("meeting_number").value = testTool.getCookie(
  "meeting_number"
);
  //This putting meeting password from browser cookies.
document.getElementById("meeting_pwd").value = testTool.getCookie(
  "meeting_pwd"
);
  //This putting meeting lagnuage from browser cookies if exists.
if (testTool.getCookie("meeting_lang"))
  document.getElementById("meeting_lang").value = testTool.getCookie(
    "meeting_lang"
  );
  //This is storing the meeting password into browser cookies when the lahuage is changed
 document.getElementById("meeting_lang").addEventListener("change", (e) => {
  testTool.setCookie(
    "meeting_lang",
    document.getElementById("meeting_lang").value
  );

  //This is the laguage setting function.
  //Not Important can be defaulted to eng.
  ZoomMtg.i18n.load(document.getElementById("meeting_lang").value);
  ZoomMtg.i18n.reload(document.getElementById("meeting_lang").value);
  ZoomMtg.reRender({ lang: document.getElementById("meeting_lang").value });
});

// copy zoom invite link to mn, autofill mn and pwd.
// This will get the meeting_number form the dom and will listen to input only allow to type numbers.
document
  .getElementById("meeting_number")
  .addEventListener("input", function (e) {
    //used RegExp to replace any non-number.
    let tmpMn = e.target.value.replace(/([^0-9])+/i, "");

    //the rest of the code is used to set meeting number and password incase the use copies and pastes the meeting URL
    //Decode the data from the Meeting URL and auto fills the 
    //meeting number and password from the url into the feilds and sets the respective cookies
    if (tmpMn.match(/([0-9]{9,11})/)) {
      tmpMn = tmpMn.match(/([0-9]{9,11})/)[1];
    }
    let tmpPwd = e.target.value.match(/pwd=([\d,\w]+)/);
    if (tmpPwd) {
      document.getElementById("meeting_pwd").value = tmpPwd[1];
      testTool.setCookie("meeting_pwd", tmpPwd[1]);
    }
    document.getElementById("meeting_number").value = tmpMn;
    testTool.setCookie(
      "meeting_number",
      document.getElementById("meeting_number").value
    );
  });
//This is to clear cookie data and Display data.
//Also,sets the role by default as host and laguage as en-US.
document.getElementById("clear_all").addEventListener("click", (e) => {
  testTool.deleteAllCookies();
  document.getElementById("display_name").value = "";
  document.getElementById("meeting_number").value = "";
  document.getElementById("meeting_pwd").value = "";
  document.getElementById("meeting_lang").value = "en-US";
  document.getElementById("meeting_role").value = 0;
  //Why?
  window.location.href = "/index.html";
});

//This is the main code.
//Here the meeting is joined by the user by filling details and adding a event listner to that button.

document.getElementById("join_meeting").addEventListener("click", (e) => {
  //preventing default behaviour of the button
  e.preventDefault();
  //Redundant code in the testTool to get document.findelementbyID()
  const meetingConfig = testTool.getMeetingConfig();
  //check if the feild is empty or not.
  if (!meetingConfig.mn || !meetingConfig.name) {
    alert("Meeting number or username is empty");
    return false;
  }
  //Set cookies of the browser with meeting_number once submitted.
  testTool.setCookie("meeting_number", meetingConfig.mn);
  //Set cookies of the brwoser with meeting_password once submitted.
  testTool.setCookie("meeting_pwd", meetingConfig.pwd);

  const signature = ZoomMtg.generateSDKSignature({
    // User can skip this
    // Get meeting number from the ID of the meeting number form input.
    //get the meeting number from DOM
    meetingNumber: meetingConfig.mn,
    //get SDK key from the const defined as const
    sdkKey: SDK_KEY,
    //get SDK secret from the const defined as const
    sdkSecret: SDK_SECRET,
    //get role form the DOM
    role: meetingConfig.role,
    //success function that will take signature from the res.result
    success: function (res) {
      console.log(res.result);
      //Set signature from res.result
      meetingConfig.signature = res.result;
      //Set sdkKey form SDK_KEY defined as const
      meetingConfig.sdkKey = SDK_KEY;
      //Creats a URL from the data that we have given to meetingConfig
      //test tool will serialize the data to the required format
      const joinUrl = "/meeting.html?" + testTool.serialize(meetingConfig);
      console.log(joinUrl);
      //The Genrated URL is opened in new tab(_blank)
      //Here is where the joining to the meeting is done
      window.open(joinUrl, "_blank");
    },
  });
});

//This just coppies details to the clipboard
function copyToClipboard(elementId) {
  //creates a input element
  var aux = document.createElement("input");
  //set the attribute of this aux elemnet same as the link attribute
  aux.setAttribute("value", document.getElementById(elementId).getAttribute('link'));
  //then append that to the body
  document.body.appendChild(aux);  
  //aux will be selected 
  aux.select();
  //now it's copied
  document.execCommand("copy");
  //the aux element is removed from the body
  document.body.removeChild(aux);
}

// click copy join link button
window.copyJoinLink = function (element) {
  const meetingConfig = testTool.getMeetingConfig();
  //checks if hte name and meeting number is empty or not
  if (!meetingConfig.mn || !meetingConfig.name) {
    alert("Meeting number or username is empty");
    return false;
  }
  const signature = ZoomMtg.generateSDKSignature({
    //get the meeting number from DOM
    meetingNumber: meetingConfig.mn,
    //get SDK key from the const defined as const
    sdkKey: SDK_KEY,
    //get SDK secret from the const defined as const
    sdkSecret: SDK_SECRET,
    //get role form the DOM
    role: meetingConfig.role,
    //success function that will take signature from the res.result
    // sdkKey form the const in the const
    success: function (res) {
      console.log(res.result);
      meetingConfig.signature = res.result;
      meetingConfig.sdkKey = SDK_KEY;
      //create a URL form the given data
      //then copy data to the clipdoard.
      const joinUrl =
        testTool.getCurrentDomain() +
        "/meeting.html?" +
        testTool.serialize(meetingConfig);
      document.getElementById('copy_link_value').setAttribute('link', joinUrl);
      copyToClipboard('copy_link_value');
    },
  });
};

