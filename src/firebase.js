  import firebase from 'firebase/app'
  import 'firebase/auth'
  import 'firebase/database'
  import 'firebase/storage'

  
  
  var firebaseConfig = {
    apiKey: "AIzaSyC9KR_E1rjpM9DNv8nlog1fDcezFyUohUU",
    authDomain: "slack-2bf22.firebaseapp.com",
    projectId: "slack-2bf22",
    storageBucket: "slack-2bf22.appspot.com",
    messagingSenderId: "1065585905226",
    appId: "1:1065585905226:web:e3d964c799910a5606a0b3",
    measurementId: "G-FQF268R555",
    databaseURL: 'https://slack-2bf22-default-rtdb.firebaseio.com/'
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase