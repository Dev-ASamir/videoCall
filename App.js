import React, {useEffect, useRef, useState} from 'react';
import {Platform, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import RtcEngine, {
  RtcLocalView,
  RtcRemoteView,
  VideoRenderMode,
} from 'react-native-agora';

import requestCameraAndAudioPermission from './components/Permission';
import styles from './components/Style';

const config = {
  appId: '8c5085e6ffa64e7a95ce62270d81a687',
  token:
    '0068c5085e6ffa64e7a95ce62270d81a687IADeRzouXZNUo1JQGh5sX9V7I8RpFjNpnKTX85XY4lcUL6sWLIoAAAAAEACaVovPcYr+YgEAAQBxiv5i',
  channelName: 'lab system ',
};

const App = () => {
  const _engine = useRef(null);
  const [isJoined, setJoined] = useState(false);
  const [peerIds, setPeerIds] = useState([]);
  const [enableVoice, setEnableVoice] = useState(false);
  const [enableVideo, setEnableVideo] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android') {
      // Request required permissions from Android
      requestCameraAndAudioPermission().then(() => {
        console.log('requested!');
      });
    }
  }, []);

  useEffect(() => {
    /**
     * @name init
     * @description Function to initialize the Rtc Engine, attach event listeners and actions
     */
    const init = async () => {
      const {appId} = config;
      _engine.current = await RtcEngine.create(appId);
      await _engine.current.enableVideo();

      _engine.current.addListener('Warning', warn => {
        console.log('Warning', warn);
      });

      _engine.current.addListener('Error', err => {
        // console.log('Error', err);
        alert(err);
      });

      _engine.current.addListener('UserJoined', (uid, elapsed) => {
        console.log('UserJoined', uid, elapsed);
        // If new user
        if (peerIds.indexOf(uid) === -1) {
          // Add peer ID to state array
          setPeerIds(prev => [...prev, uid]);
        }
      });

      _engine.current.addListener('UserOffline', (uid, reason) => {
        console.log('UserOffline', uid, reason);
        // Remove peer ID from state array
        setPeerIds(prev => prev.filter(id => id !== uid));
      });

      // If Local user joins RTC channel
      _engine.current.addListener(
        'JoinChannelSuccess',
        (channel, uid, elapsed) => {
          console.log('JoinChannelSuccess', channel, uid, elapsed);
          // Set state variable to true
          setJoined(true);
        },
      );
    };

    // _engine.addListener('TokenPrivilegeWillExpire', token => {
    //   fetch(URL + '/rtc/' + channelName + '/publisher/uid/' + UID)
    //     .then(function (response) {
    //       console.log('DDDDDDDD', res);
    //       response.json().then(async function (data) {
    //         _engine?.renewToken(data.rtcToken);
    //       });
    //     })
    //     .catch(function (err) {
    //       console.log('Fetch Error', err);
    //     });
    // });
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * @name startCall
   * @description Function to start the call
   */
  const startCall = async () => {
    // Join Channel using null token and channel name
    await _engine.current?.joinChannel(
      config.token,
      config.channelName,
      null,
      0,
    );
  };

  /**
   * @name endCall
   * @description Function to end the call
   */
  const endCall = async () => {
    await _engine.current?.leaveChannel();
    setPeerIds([]);
    setJoined(false);
  };

  // const cameraOff = async () => {
  //   const res = await _engine.current?.disableVideo();

  //   console.log('DDDDDDDD', res);
  // };

  // const cameraON = async () => {
  //   const res = await _engine.current?.enableVideo();

  //   console.log('DDDDDDDD', res);
  // };
  // const soundOff = async () => {
  //   const res = await _engine.current?.disableAudio();

  //   console.log('DDDDDDDD', res);
  // };

  // const soundOn = async () => {
  //   const res = await _engine.current?.enableAudio();

  //   console.log('DDDDDDDD', res);
  // };

  // const soundOff2 = async () => {
  //   const res = await _engine.current?.muteLocalAudioStream();

  //   console.log('DDDDDDDD', res);
  // };

  const soundOn2 = async () => {
    setEnableVoice(!enableVoice);
    const res = await _engine.current?.enableLocalAudio(enableVoice);

    console.log('DDDDDDDD', res);
  };
  const videoOn2 = async () => {
    setEnableVideo(!enableVideo);
    const res = await _engine.current?.enableLocalVideo(enableVideo);

    console.log('DDDDDDDD', res);
  };

  // const soundOffRemote1 = async () => {
  //   const res = await _engine.current?.muteRemoteAudioStream();

  //   console.log('DDDDDDDD', res);
  // };

  // const soundOffRemoteAll = async () => {
  //   const res = await _engine.current?.muteAllRemoteAudioStreams();

  //   console.log('DDDDDDDD', res);
  // };
  React.useEffect(() => {
    startUp();
  }, []);
  const startUp = async () => {
    const res = await _engine.addListener('TokenPrivilegeWillExpire', token => {
      // let that = this;
      fetch(URL + '/rtc/' + channelName + '/publisher/uid/' + UID)
        .then(function (response) {
          console.log('DDDDDDDD', res);
          response.json().then(async function (data) {
            _engine?.renewToken(data.rtcToken);
          });
        })
        .catch(function (err) {
          console.log('Fetch Error', err);
        });
    });
  };

  const _renderVideos = () => {
    return isJoined ? (
      <View style={styles.fullView}>
        <RtcLocalView.SurfaceView
          style={styles.max}
          channelId={config.channelName}
          renderMode={VideoRenderMode.Hidden}
        />
        {_renderRemoteVideos()}
      </View>
    ) : null;
  };

  const _renderRemoteVideos = () => {
    return (
      <ScrollView
        style={styles.remoteContainer}
        contentContainerStyle={styles.padding}
        horizontal={true}>
        {/* <View
          style={{
            padding: 0,
            flexDirection: 'row',
            alignSelf: 'flex-start',

            marginTop: 10,
          }}>
           <View style={{flexDirection: 'row', alignSelf: 'flex-end'}}>
            <TouchableOpacity
              onPress={cameraON}
              style={[styles.button, {marginHorizontal: 4}]}>
              <Text style={[styles.buttonText]}>Camera ON</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={cameraOff} style={styles.button}>
              <Text style={[styles.buttonText]}>Camera Off</Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignSelf: 'flex-start',

              marginTop: 10,
            }}>
            <TouchableOpacity
              onPress={soundOn}
              style={[styles.button, {marginHorizontal: 4}]}>
              <Text style={styles.buttonText}> sound ON </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={soundOff} style={styles.button}>
              <Text style={styles.buttonText}> Mute </Text>
            </TouchableOpacity>
          </View> */}
        <View
          style={{
            flexDirection: 'row',
            alignSelf: 'flex-start',

            marginTop: 10,
          }}>
          {/* <TouchableOpacity
              onPress={soundOn2}
              style={[styles.button, {marginHorizontal: 4}]}>
              <Text style={styles.buttonText}> sound ON2 </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={videoOn2} style={styles.button}>
              <Text style={styles.buttonText}> video On2 </Text>
            </TouchableOpacity> 
          </View>*/}
        </View>
        {/* <View
          style={{
            flexDirection: 'row',
            alignSelf: 'flex-start',

            marginTop: 10,
            marginBottom: 10,
          }}>
          <TouchableOpacity onPress={soundOffRemote1} style={styles.button}>
            <Text style={styles.buttonText}> MuteRemoteOne </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={soundOffRemoteAll} style={styles.button}>
            <Text style={styles.buttonText}> MuteRemoteAll </Text>
          </TouchableOpacity>
        </View> */}
        {peerIds.map(value => {
          return (
            <RtcRemoteView.SurfaceView
              style={styles.remote}
              uid={value}
              channelId={config.channelName}
              renderMode={VideoRenderMode.Hidden}
              zOrderMediaOverlay={true}
            />
          );
        })}
      </ScrollView>
    );
  };

  return (
    <View style={styles.max}>
      <View style={styles.max}>
        <View style={styles.buttonHolder}>
          <TouchableOpacity onPress={startCall} style={styles.button}>
            <Text style={styles.buttonText}> Start Call </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={endCall} style={styles.button}>
            <Text style={styles.buttonText}> End Call </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={soundOn2}
            style={[styles.button, {marginHorizontal: 4}]}>
            <Text style={styles.buttonText}>
              {enableVoice ? 'sound ON' : 'Mute'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={videoOn2} style={styles.button}>
            <Text style={styles.buttonText}>
              {enableVideo ? 'video On' : 'video Off'}
            </Text>
          </TouchableOpacity>
        </View>
        {_renderVideos()}
      </View>
    </View>
  );
};

export default App;

// import React, {useEffect, useRef, useState} from 'react';
// import {Platform, ScrollView, Text, TouchableOpacity, View} from 'react-native';
// import RtcEngine, {
//   RtcLocalView,
//   RtcRemoteView,
//   VideoRenderMode,
// } from 'react-native-agora';

// import requestCameraAndAudioPermission from './components/Permission';
// import styles from './components/Style';

// const config = {
//   appId: '8c5085e6ffa64e7a95ce62270d81a687',
//   token:
//     '0068c5085e6ffa64e7a95ce62270d81a687IADeRzouXZNUo1JQGh5sX9V7I8RpFjNpnKTX85XY4lcUL6sWLIoAAAAAEACaVovPcYr+YgEAAQBxiv5i',
//   channelName: 'lab system ',
// };

// const App = () => {
//   const _engine = useRef(null);
//   const [isJoined, setJoined] = useState(false);
//   const [peerIds, setPeerIds] = useState([]);

//   useEffect(() => {
//     if (Platform.OS === 'android') {
//       // Request required permissions from Android
//       requestCameraAndAudioPermission().then(() => {
//         console.log('requested!');
//       });
//     }
//   }, []);

//   useEffect(() => {
//     /**
//      * @name init
//      * @description Function to initialize the Rtc Engine, attach event listeners and actions
//      */
//     const init = async () => {
//       const {appId} = config;
//       _engine.current = await RtcEngine.create(appId);
//       await _engine.current.enableVideo();

//       _engine.current.addListener('Warning', warn => {
//         console.log('Warning', warn);
//       });

//       _engine.current.addListener('Error', err => {
//         // console.log('Error', err);
//         alert(err);
//       });

//       _engine.current.addListener('UserJoined', (uid, elapsed) => {
//         console.log('UserJoined', uid, elapsed);
//         // If new user
//         if (peerIds.indexOf(uid) === -1) {
//           // Add peer ID to state array
//           setPeerIds(prev => [...prev, uid]);
//         }
//       });

//       _engine.current.addListener('UserOffline', (uid, reason) => {
//         console.log('UserOffline', uid, reason);
//         // Remove peer ID from state array
//         setPeerIds(prev => prev.filter(id => id !== uid));
//       });

//       // If Local user joins RTC channel
//       _engine.current.addListener(
//         'JoinChannelSuccess',
//         (channel, uid, elapsed) => {
//           console.log('JoinChannelSuccess', channel, uid, elapsed);
//           // Set state variable to true
//           setJoined(true);
//         },
//       );
//     };
//     init();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   /**
//    * @name startCall
//    * @description Function to start the call
//    */
//   const startCall = async () => {
//     // Join Channel using null token and channel name
//     await _engine.current?.joinChannel(
//       config.token,
//       config.channelName,
//       null,
//       0,
//     );
//   };

//   /**
//    * @name endCall
//    * @description Function to end the call
//    */
//   const endCall = async () => {
//     await _engine.current?.leaveChannel();
//     setPeerIds([]);
//     setJoined(false);
//   };

//   const cameraOff = async () => {
//     const res = await _engine.current?.disableVideo();

//     console.log('DDDDDDDD', res);
//   };

//   const cameraON = async () => {
//     const res = await _engine.current?.enableVideo();

//     console.log('DDDDDDDD', res);
//   };
//   const soundOff = async () => {
//     const res = await _engine.current?.disableAudio();

//     console.log('DDDDDDDD', res);
//   };

//   const soundOn = async () => {
//     const res = await _engine.current?.enableAudio();

//     console.log('DDDDDDDD', res);
//   };

//   const _renderVideos = () => {
//     return isJoined ? (
//       <View style={styles.fullView}>
//         <RtcLocalView.SurfaceView
//           style={styles.max}
//           channelId={config.channelName}
//           renderMode={VideoRenderMode.Hidden}
//         />
//         {_renderRemoteVideos()}
//       </View>
//     ) : null;
//   };

//   const _renderRemoteVideos = () => {
//     return (
//       <ScrollView
//         style={styles.remoteContainer}
//         contentContainerStyle={styles.padding}
//         horizontal={true}>
//         <View style={{padding: 0}}>
//           <View style={{flexDirection: 'row', alignSelf: 'flex-end'}}>
//             <TouchableOpacity
//               onPress={cameraON}
//               style={[styles.button, {marginHorizontal: 4}]}>
//               <Text style={[styles.buttonText]}>Camera ON</Text>
//             </TouchableOpacity>
//             <TouchableOpacity onPress={cameraOff} style={styles.button}>
//               <Text style={[styles.buttonText]}>Camera Off</Text>
//             </TouchableOpacity>
//           </View>
//           <View
//             style={{
//               flexDirection: 'row',
//               alignSelf: 'flex-start',

//               marginTop: 10,
//             }}>
//             <TouchableOpacity
//               onPress={soundOn}
//               style={[styles.button, {marginHorizontal: 4}]}>
//               <Text style={styles.buttonText}> sound ON </Text>
//             </TouchableOpacity>
//             <TouchableOpacity onPress={soundOff} style={styles.button}>
//               <Text style={styles.buttonText}> Mute </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//         {peerIds.map(value => {
//           return (
//             <RtcRemoteView.SurfaceView
//               style={styles.remote}
//               uid={value}
//               channelId={config.channelName}
//               renderMode={VideoRenderMode.Hidden}
//               zOrderMediaOverlay={true}
//             />
//           );
//         })}
//       </ScrollView>
//     );
//   };

//   return (
//     <View style={styles.max}>
//       <View style={styles.max}>
//         <View style={styles.buttonHolder}>
//           <TouchableOpacity onPress={startCall} style={styles.button}>
//             <Text style={styles.buttonText}> Start Call </Text>
//           </TouchableOpacity>
//           <TouchableOpacity onPress={endCall} style={styles.button}>
//             <Text style={styles.buttonText}> End Call </Text>
//           </TouchableOpacity>
//         </View>
//         {_renderVideos()}
//       </View>
//     </View>
//   );
// };

// export default App;
