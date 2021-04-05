import React, {useState, useEffect, useRef} from 'react'
import { useParams, useHistory } from "react-router-dom";
import './Videochat.css';
import logo from '../../logo.svg';
import hangup from '../../hangup.png';
import io from 'socket.io-client';

export default function Videochat() {
    let history = useHistory();
    const { id } = useParams();
    const [localWebRTCPeer,setLocalWebRTCPeer] = useState(new RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:stun2.l.google.com:19302",
            },
            {
                urls: 'turn:turn.bistri.com:80',
                credential: 'homeo',
                username: 'homeo'
             },
        ]
    }))
    // useRef will let me access to the Video in the DOM with the property current
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    // It's necessary to create a Ref for the file asset localhost:5000/socket.io/socket.io.js
    const socketRef = useRef();
    const localStream = useRef();
    const remotePeer = useRef();
    
    useEffect(() => {
         // Ask the user to activate the camera and mic
        navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        .then(audioVideoStream => {
            localVideoRef.current.srcObject = audioVideoStream;
            localStream.current = audioVideoStream;
            socketRef.current = io.connect();
            socketRef.current.emit("registerVideochatID", id);
            socketRef.current.on("remotePeerJoined", userID => {
                setLocalWebRTCPeer(createWebRTCPeer(userID))
                localStream.current.getTracks().forEach(track => localWebRTCPeer.addTrack(track, localStream.current));
                remotePeer.current = userID;
            });
            socketRef.current.on("localPeerJoined", userID => remotePeer.current = userID);
            socketRef.current.on("SDPOffer", (SDPOfferData) => {
                setLocalWebRTCPeer(createWebRTCPeer())
                localWebRTCPeer.setRemoteDescription(new RTCSessionDescription(SDPOfferData.sdp))
                .then(() => {
                    localStream.current.getTracks().forEach(track => localWebRTCPeer.addTrack(track, localStream.current));
                })
                .then(() => {
                    return localWebRTCPeer.createAnswer({ offerToReceiveVideo: 1 , offerToReceiveAudio: 1 });
                })
                .then(SDPAnswerData => {
                    return localWebRTCPeer.setLocalDescription(SDPAnswerData);
                })
                .then(() => {
                    socketRef.current.emit("SDPAnswer", {
                        callee: SDPOfferData.caller,
                        caller: socketRef.current.id,
                        sdp: localWebRTCPeer.localDescription
                    });
                })
            });
            socketRef.current.on("SDPAnswer", (SDPAnswerData) => localWebRTCPeer.setRemoteDescription(new RTCSessionDescription(SDPAnswerData.sdp)).catch(SDPAnswerEvent => alert(SDPAnswerEvent)));
            socketRef.current.on("ICECandidate", (ICECandidateData) => localWebRTCPeer.addIceCandidate(new RTCIceCandidate(ICECandidateData)).catch(ICECandidateEvent => alert(ICECandidateEvent)));
        });
    }, []);

    const createWebRTCPeer = (userID) => {
        localWebRTCPeer.onicecandidate = (onICECandidateEvent) => (onICECandidateEvent.candidate) ? (socketRef.current.emit("ICECandidate", {callee: remotePeer.current,candidate: onICECandidateEvent.candidate})): null;
        localWebRTCPeer.ontrack = (onTrackEvent) => remoteVideoRef.current.srcObject = onTrackEvent.streams[0];
        localWebRTCPeer.onnegotiationneeded = () => {
            localWebRTCPeer.createOffer({ offerToReceiveVideo: 1 , offerToReceiveAudio: 1 })
            .then(SDPOffer =>  localWebRTCPeer.setLocalDescription(SDPOffer))
            .then(() => socketRef.current.emit("SDPOffer", {callee: userID, caller: socketRef.current.id, sdp:  localWebRTCPeer.localDescription}))
            .catch(createOfferErrorEvent => alert(createOfferErrorEvent));
        };
        return localWebRTCPeer;
    }

    const handleHangUp = () => {
        localStream.current.getTracks().forEach((track) => track.stop());
        history.push('/')
    }
    return (
        <div className="Videochat">
            <nav className="Videochat__Navbar">
                <img src={logo} className="Videochat__Logo" alt="logo" />
                <h1 className="Videochat__NavabarTitle">Videochat</h1>
            </nav>
            <video autoPlay playsInline muted ref={remoteVideoRef} className="Videochat__MainVideo"/>
            <video autoPlay playsInline muted ref={localVideoRef} className="Videochat__MinorVideo"/>
            <nav className="Videochat__Footbar">
                <div className="Videochat__HangUpButton">
                    <img src={hangup} onClick={handleHangUp} className="Videochat__FootbarHangUp" alt="Hang Up"/> 
                </div>
            </nav>
        </div>
    )
}


