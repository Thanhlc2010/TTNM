import { useEffect, useRef, useState } from "react";
import service from "../services/service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandPaper } from "@fortawesome/free-solid-svg-icons";
import { Camera, Star, CheckCircle } from 'lucide-react';
// import Img from "../Img";
// import { default as A } from '../Img/A.png';
const Img = []

// We'll limit the processing size to 200px.
const maxVideoSize = 224;
const LETTERS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "_NOTHING",
  "_SPACE",
];
const THRESHOLD = 5;

const THRESHOLDS = {
  S: 3,
  E: 5,
  A: 5,
  N: 6,
  R: 5,
};
/**
 * What we're going to render is:
 *
 * 1. A video component so the user can see what's on the camera.
 *
 * 2. A button to generate an image of the video, load OpenCV and
 * process the image.
 *
 * 3. A canvas to allow us to capture the image of the video and
 * show it to the user.
 */
export default function Page() {
  const videoElement = useRef(null);
  const canvasEl = useRef(null);
  const outputCanvasEl = useRef(null);
  const [letter, setLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wordsLearned, setWordsLearned] = useState("");
  const [currentImage, setCurrentImage] = useState(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const random = () => {
    const random = Math.floor(Math.random() * 26);
    return random;
  };
  /**
   * In the onClick event we'll capture a frame within
   * the video to pass it to our service.
   */
  async function processImage() {
    if (
      videoElement !== null &&
      canvasEl !== null &&
      typeof videoElement.current !== "undefined" &&
      videoElement.current !== null
    ) {
      const ctx = canvasEl.current.getContext("2d");
      console.log("ctx", ctx);
      ctx.drawImage(videoElement.current, 0, 0, maxVideoSize, maxVideoSize);
      console.log("go here");
      // Lấy dữ liệu ảnh từ canvas
      try {
        const image = ctx.getImageData(0, 0, maxVideoSize, maxVideoSize);
        console.log("image", image);
        const processedImage = await service.imageProcessing(image);

        const ctxOutput = outputCanvasEl.current.getContext("2d");
        console.log("processedImage: ", processedImage);
        ctxOutput.putImageData(processedImage.data.payload, 0, 0);
        const prediction = await service.predict(processedImage.data.payload);
        console.log("prediction: ", prediction);
        const predictedLetter = prediction.data.payload;
        const letterValue = LETTERS[predictedLetter];
        setLetter(letterValue);

        if (letterValue === "_SPACE") return;
        if (letterValue === "_NOTHING") return;
        if (letterValue === wordsLearned) {
          setScore((prev) => prev + 10);
          let rand = random();
          setFeedback('Chính xác! Tuyệt vời!');
          setWordsLearned(LETTERS[rand]);
          setCurrentImage(Img[rand]);
        } else {
          setFeedback('Hãy thử lại. Xem hướng dẫn bên dưới.');
        }
      } catch (error) {
        console.error("Error processing image:", error);
        alert("Failed to process image. Please try again.");
      }
    }
  }

  /**
   * In the useEffect hook we'll load the video
   * element to show what's on camera.
   */
  useEffect(() => {
    async function initCamera() {
      videoElement.current.width = maxVideoSize;
      videoElement.current.height = maxVideoSize;

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: "environment",
            width: maxVideoSize,
            height: maxVideoSize,
          },
        });
        videoElement.current.srcObject = stream;

        return new Promise((resolve) => {
          videoElement.current.onloadedmetadata = () => {
            resolve(videoElement.current);
          };
        });
      }
      const errorMessage =
        "This browser does not support video capture, or this device does not have a camera";
      alert(errorMessage);
      return Promise.reject(errorMessage);
    }

    async function load() {
      const videoLoaded = await initCamera();
      await service.load();
      videoLoaded.play();
      //   setTimeout(processImage, 0);
      setLoading(false);

    //   let rand = random();
      let rand = 24;
      setWordsLearned(LETTERS[rand]);
    setCurrentImage(Img[rand]); 
      return videoLoaded;
    }

    load();
  }, []);

  return (
    <>
      <div className="bg-blue-50 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6">
          {/* Header with Score */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <Star className="text-yellow-400" />
              <span className="font-bold text-lg text-yellow-400">{score} Điểm</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-green-500" />
              <span className="text-green-500">{score / 10} Từ Đã Học</span>
            </div>
          </div>

          {/* Current Word Section */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-blue-600 mb-4">
              Học Ký Hiệu: {wordsLearned}
            </h2>
            {feedback && (
              <div
                className={`mb-4 p-2 rounded ${
                  feedback.includes("Chính xác")
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {feedback}
              </div>
            )}
          </div>

          {/* Main Learning Area */}
          <div className="grid grid-cols-2 gap-6">
            {/* Video/Image Guide Section */}
            <div className="bg-blue-100 rounded-lg p-4 flex items-center justify-center">
              <div className="w-full h-64 bg-blue-200 rounded-md flex items-center justify-center text-blue-600">
                {/* {currentImage ? */}
                    {/* <img src={A} alt="" width={maxVideoSize}     height={maxVideoSize} /> */}
                    {/* : */}
                    "Ảnh Hướng Dẫn"
                {/* }  */}
              </div>
            </div>

            {/* Camera Recognition Section */}
            <div className="bg-gray-100 rounded-lg p-4">
            <div style={{ display: loading ? "none" : "block" }}>
              <div className="row justify-content-center">
                <div className="col-12 text-center">
                  <video className="video" playsInline ref={videoElement} />
                </div>
                <canvas
                  style={{ display: "none" }}
                  ref={canvasEl}
                  width={maxVideoSize}
                  height={maxVideoSize}
                ></canvas>
                <canvas
                  className="col-xs-12"
                  style={{ display: "none" }}
                  ref={outputCanvasEl}
                  width={maxVideoSize}
                  height={maxVideoSize}
                ></canvas>
              </div>

            </div>

              {/* Capture Button */}
              <button
                onClick={() => processImage()}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Chụp Ký Hiệu
              </button>

              {/* Captured Image Preview */}
              {capturedImage && (
                <div className="mt-4">
                  <img
                    src={capturedImage}
                    alt="Captured Sign"
                    className="w-full rounded-md"
                  />
                </div>
              )}
            </div>

            
          </div>
        </div>
      </div>
    </>
  );
}