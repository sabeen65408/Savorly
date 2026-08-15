import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Square, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { translateRecipeToTamil } from "../api/recipeApi";

const speeds = [0.8, 1, 1.2, 1.4];

function CookMode({ recipe, onClose }) {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  const [language, setLanguage] = useState(null);
  const [step, setStep] = useState(0);
  const [rate, setRate] = useState(0.8);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [voices, setVoices] = useState(() => supported ? window.speechSynthesis.getVoices() : []);
  const [voiceURI, setVoiceURI] = useState("");
  const [translatedTamilInstructions, setTranslatedTamilInstructions] = useState([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const stoppingRef = useRef(false);
  const tamilInstructions = recipe.instructionsTamil?.length ? recipe.instructionsTamil : recipe.tamilInstructions?.length ? recipe.tamilInstructions : translatedTamilInstructions;
  const instructions = useMemo(() => language === "ta-IN" ? tamilInstructions : (recipe.instructions || []), [language, recipe.instructions, tamilInstructions]);
  const compatibleVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith(language?.split("-")[0] || ""));
  const selectedVoice = compatibleVoices.find((voice) => voice.voiceURI === voiceURI) || compatibleVoices[0];

  const refreshVoices = useCallback(() => {
    if (supported) setVoices(window.speechSynthesis.getVoices());
  }, [supported]);

  useEffect(() => {
    if (!supported) return undefined;
    window.speechSynthesis.addEventListener("voiceschanged", refreshVoices);
    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.removeEventListener("voiceschanged", refreshVoices);
    };
  }, [refreshVoices, supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    stoppingRef.current = true;
    window.speechSynthesis.cancel();
    setStatus("idle");
  }, [supported]);

  const speak = (stepIndex = step, playbackRate = rate) => {
    if (!supported || !instructions[stepIndex]) return;
    stoppingRef.current = false;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(instructions[stepIndex]);
    utterance.lang = selectedVoice?.lang || language;
    utterance.rate = playbackRate;
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.onend = () => {
      if (stoppingRef.current) return;

      if (stepIndex === instructions.length - 1) {
        setStatus("complete");
        return;
      }

      const nextStep = stepIndex + 1;
      setStep(nextStep);
      window.setTimeout(() => {
        if (!stoppingRef.current) speak(nextStep, playbackRate);
      }, 120);
    };
    utterance.onerror = (event) => {
      if (!stoppingRef.current && event.error !== "canceled" && event.error !== "interrupted") setMessage("Voice playback could not start. Check your device volume and text-to-speech settings.");
      setStatus("idle");
    };
    window.speechSynthesis.speak(utterance);
    window.speechSynthesis.resume();
    setStatus("playing");
  };

  const chooseLanguage = async (code) => {
    setMessage("");
    if (code === "ta-IN" && tamilInstructions.length === 0) {
      try {
        setIsTranslating(true);
        const response = await translateRecipeToTamil(recipe._id);
        if (!response?.success || !response.instructionsTamil?.length) throw new Error(response?.message);
        setTranslatedTamilInstructions(response.instructionsTamil);
      } catch (error) {
        setMessage(error?.response?.data?.message || error.message || "Tamil translation is temporarily unavailable.");
        return;
      } finally {
        setIsTranslating(false);
      }
    }
    setStep(0);
    setLanguage(code);
  };

  const changeRate = (nextRate) => {
    const wasPlaying = status === "playing";
    setRate(nextRate);
    if (wasPlaying) {
      stop();
      window.setTimeout(() => speak(step, nextRate), 80);
    }
  };
  const progress = useMemo(() => instructions.length ? ((step + 1) / instructions.length) * 100 : 0, [instructions.length, step]);

  if (!language) return <div className="cook-modal-backdrop" role="presentation"><section className="language-dialog" role="dialog" aria-modal="true" aria-labelledby="voice-language-title"><button type="button" className="cook-close" onClick={onClose} aria-label="Close Listen and Cook"><X /></button><span className="eyebrow">LISTEN & COOK</span><h2 id="voice-language-title">Choose a language</h2><p>Follow {recipe.title} step by step while you cook.</p>{!supported && <p className="voice-error" role="alert">Voice guidance is not supported by this browser. Try a current version of Chrome, Edge, or Safari.</p>}{message && <p className="voice-error" role="alert">{message}</p>}<div className="language-options"><button type="button" disabled={!supported || isTranslating} onClick={() => chooseLanguage("en-IN")}>English <small>en-IN</small></button><button type="button" disabled={!supported || isTranslating} onClick={() => chooseLanguage("ta-IN")}>{isTranslating ? "Translating…" : "தமிழ்"} <small>ta-IN</small></button></div></section></div>;

  return <div className="cook-modal-backdrop" role="presentation"><section className="cook-mode" role="dialog" aria-modal="true" aria-labelledby="cook-mode-title"><header className="cook-mode-header"><div><span className="eyebrow">COOK MODE</span><h2 id="cook-mode-title">{recipe.title}</h2></div><button type="button" className="cook-close" onClick={() => { stop(); onClose(); }} aria-label="Exit Cook Mode"><X /></button></header><div className="cook-progress"><span>Step {step + 1} of {instructions.length}</span><div><i style={{ width: `${progress}%` }} /></div></div><article className="cook-current-step"><span>STEP {step + 1}</span><p>{instructions[step]}</p></article>{message && <p className="voice-error" role="alert">{message}</p>}<div className="cook-controls"><button type="button" onClick={() => { stop(); setStep((current) => Math.max(0, current - 1)); }} disabled={step === 0} aria-label="Previous step"><ChevronLeft /></button>{status === "playing" ? <button type="button" className="cook-play" onClick={() => { window.speechSynthesis.pause(); setStatus("paused"); }} aria-label="Pause"><Pause /></button> : <button type="button" className="cook-play" onClick={() => status === "paused" ? (window.speechSynthesis.resume(), setStatus("playing")) : speak()} aria-label="Play"><Play /></button>}<button type="button" onClick={() => { stop(); window.setTimeout(() => speak(step), 80); }} aria-label="Restart current step"><RotateCcw /></button><button type="button" onClick={() => { stop(); setStep((current) => Math.min(instructions.length - 1, current + 1)); }} disabled={step === instructions.length - 1} aria-label="Next step"><ChevronRight /></button><button type="button" onClick={stop} aria-label="Stop voice guidance"><Square /></button></div><div className="cook-settings"><label className="speed-control">Speed <select value={rate} onChange={(event) => changeRate(Number(event.target.value))}>{speeds.map((speed) => <option value={speed} key={speed}>{speed}×</option>)}</select></label>{compatibleVoices.length > 0 && <label className="voice-control">Voice <select value={voiceURI || selectedVoice?.voiceURI || ""} onChange={(event) => setVoiceURI(event.target.value)}>{compatibleVoices.map((voice) => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name}</option>)}</select></label>}</div>{status === "complete" && <p className="cook-complete">You’re all done — enjoy your meal.</p>}<ol className="cook-step-list">{instructions.map((instruction, index) => <li key={`${index}-${instruction}`} className={index === step ? "active" : ""}><button type="button" onClick={() => { stop(); setStep(index); }}>{index + 1}</button><span>{instruction}</span></li>)}</ol></section></div>;
}

export default CookMode;
