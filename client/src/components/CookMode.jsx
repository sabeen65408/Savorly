import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  Square,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { translateRecipeToTamil } from "../api/recipeApi";

const speeds = [0.8, 1, 1.2, 1.4];

function CookMode({ recipe, onClose }) {
  // ==========================================
  // SPEECH SUPPORT
  // ==========================================

  const supported =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window;

  // ==========================================
  // STATE
  // ==========================================

  const [language, setLanguage] = useState(null);

  const [step, setStep] = useState(0);

  const [rate, setRate] = useState(0.8);

  const [status, setStatus] = useState("idle");

  /*
   * Playback modes:
   *
   * "single"
   *   → Play only the currently selected step.
   *
   * "continuous"
   *   → Play the selected step and continue
   *     automatically through the remaining steps.
   */
  const [playbackMode, setPlaybackMode] = useState("single");

  const [message, setMessage] = useState("");

  const [voices, setVoices] = useState(() =>
    supported ? window.speechSynthesis.getVoices() : []
  );

  const [voiceURI, setVoiceURI] = useState("");

  const [translatedTamilInstructions, setTranslatedTamilInstructions] =
    useState([]);

  const [isTranslating, setIsTranslating] = useState(false);

  /*
   * Used to prevent onend from automatically
   * starting another step after the user manually
   * stops/cancels speech.
   */
  const stoppingRef = useRef(false);

  // ==========================================
  // TAMIL INSTRUCTIONS
  // ==========================================

  const tamilInstructions = recipe.instructionsTamil?.length
    ? recipe.instructionsTamil
    : recipe.tamilInstructions?.length
      ? recipe.tamilInstructions
      : translatedTamilInstructions;

  // ==========================================
  // CURRENT INSTRUCTIONS
  // ==========================================

  const instructions = useMemo(
    () =>
      language === "ta-IN"
        ? tamilInstructions
        : recipe.instructions || [],
    [
      language,
      recipe.instructions,
      tamilInstructions,
    ]
  );

  // ==========================================
  // COMPATIBLE VOICES
  // ==========================================

  const compatibleVoices = voices.filter((voice) =>
    voice.lang
      .toLowerCase()
      .startsWith(language?.split("-")[0] || "")
  );

  const selectedVoice =
    compatibleVoices.find(
      (voice) => voice.voiceURI === voiceURI
    ) || compatibleVoices[0];

  // ==========================================
  // REFRESH AVAILABLE VOICES
  // ==========================================

  const refreshVoices = useCallback(() => {
    if (supported) {
      setVoices(window.speechSynthesis.getVoices());
    }
  }, [supported]);

  // ==========================================
  // SPEECH SYNTHESIS SETUP
  // ==========================================

  useEffect(() => {
    if (!supported) return undefined;

    window.speechSynthesis.addEventListener(
      "voiceschanged",
      refreshVoices
    );

    return () => {
      window.speechSynthesis.cancel();

      window.speechSynthesis.removeEventListener(
        "voiceschanged",
        refreshVoices
      );
    };
  }, [refreshVoices, supported]);

  // ==========================================
  // STOP SPEECH
  // ==========================================

  const stop = useCallback(() => {
    if (!supported) return;

    /*
     * Mark this as a manual stop so that
     * utterance.onend does not continue to
     * the next step.
     */
    stoppingRef.current = true;

    window.speechSynthesis.cancel();

    setStatus("idle");
  }, [supported]);

  // ==========================================
  // SPEAK
  // ==========================================

  const speak = useCallback(
    (
      stepIndex = step,
      playbackRate = rate,
      mode = playbackMode
    ) => {
      if (
        !supported ||
        !instructions[stepIndex]
      ) {
        return;
      }

      // ----------------------------------------
      // RESET STOP FLAG
      // ----------------------------------------

      stoppingRef.current = false;

      // ----------------------------------------
      // CANCEL ANY CURRENT SPEECH
      // ----------------------------------------

      window.speechSynthesis.cancel();

      // ----------------------------------------
      // CREATE UTTERANCE
      // ----------------------------------------

      const utterance =
        new SpeechSynthesisUtterance(
          instructions[stepIndex]
        );

      // ----------------------------------------
      // LANGUAGE
      // ----------------------------------------

      utterance.lang =
        selectedVoice?.lang || language;

      // ----------------------------------------
      // SPEED
      // ----------------------------------------

      utterance.rate = playbackRate;

      // ----------------------------------------
      // VOICE
      // ----------------------------------------

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // ========================================
      // WHEN CURRENT STEP FINISHES
      // ========================================

      utterance.onend = () => {
        // If user manually stopped playback,
        // don't continue to another step.
        if (stoppingRef.current) {
          return;
        }

        // --------------------------------------
        // SINGLE STEP MODE
        // --------------------------------------
        //
        // Example:
        //
        // User selects Step 4
        // User clicks Play
        //
        // Step 4 plays
        // Step 4 finishes
        // STOP
        //

        if (mode === "single") {
          setStatus("complete");
          return;
        }

        // --------------------------------------
        // CONTINUOUS MODE
        // --------------------------------------
        //
        // Continue to the next step.
        //

        if (
          stepIndex ===
          instructions.length - 1
        ) {
          setStatus("complete");
          return;
        }

        const nextStep = stepIndex + 1;

        // Update the displayed step.
        setStep(nextStep);

        // Small delay between steps.
        window.setTimeout(() => {
          if (!stoppingRef.current) {
            speak(
              nextStep,
              playbackRate,
              "continuous"
            );
          }
        }, 120);
      };

      // ========================================
      // SPEECH ERROR
      // ========================================

      utterance.onerror = (event) => {
        if (
          !stoppingRef.current &&
          event.error !== "canceled" &&
          event.error !== "interrupted"
        ) {
          setMessage(
            "Voice playback could not start. Check your device volume and text-to-speech settings."
          );
        }

        setStatus("idle");
      };

      // ========================================
      // START SPEECH
      // ========================================

      window.speechSynthesis.speak(
        utterance
      );

      window.speechSynthesis.resume();

      setStatus("playing");
    },
    [
      supported,
      instructions,
      step,
      rate,
      playbackMode,
      selectedVoice,
      language,
    ]
  );

  // ==========================================
  // LANGUAGE SELECTION
  // ==========================================

  const chooseLanguage = async (code) => {
    setMessage("");

    // ----------------------------------------
    // TAMIL TRANSLATION
    // ----------------------------------------

    if (
      code === "ta-IN" &&
      tamilInstructions.length === 0
    ) {
      try {
        setIsTranslating(true);

        const response =
          await translateRecipeToTamil(
            recipe._id
          );

        if (
          !response?.success ||
          !response.instructionsTamil?.length
        ) {
          throw new Error(
            response?.message
          );
        }

        setTranslatedTamilInstructions(
          response.instructionsTamil
        );
      } catch (error) {
        setMessage(
          error?.response?.data?.message ||
            error.message ||
            "Tamil translation is temporarily unavailable."
        );

        return;
      } finally {
        setIsTranslating(false);
      }
    }

    // ----------------------------------------
    // RESET TO STEP 1
    // ----------------------------------------

    setStep(0);

    // ----------------------------------------
    // DEFAULT MODE
    //
    // When a language is first selected,
    // Play should start from Step 1 and
    // continue through the recipe.
    // ----------------------------------------

    setPlaybackMode("continuous");

    setLanguage(code);
  };

  // ==========================================
  // CHANGE PLAYBACK SPEED
  // ==========================================

  const changeRate = (nextRate) => {
    const wasPlaying =
      status === "playing";

    const currentMode = playbackMode;

    setRate(nextRate);

    if (wasPlaying) {
      stop();

      window.setTimeout(() => {
        speak(
          step,
          nextRate,
          currentMode
        );
      }, 80);
    }
  };

  // ==========================================
  // PROGRESS
  // ==========================================

  const progress = useMemo(
    () =>
      instructions.length
        ? ((step + 1) /
            instructions.length) *
          100
        : 0,
    [
      instructions.length,
      step,
    ]
  );

  // ==========================================
  // LANGUAGE SELECTION SCREEN
  // ==========================================

  if (!language) {
    return (
      <div
        className="cook-modal-backdrop"
        role="presentation"
      >
        <section
          className="language-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="voice-language-title"
        >
          <button
            type="button"
            className="cook-close"
            onClick={onClose}
            aria-label="Close Listen and Cook"
          >
            <X />
          </button>

          <span className="eyebrow">
            LISTEN & COOK
          </span>

          <h2 id="voice-language-title">
            Choose a language
          </h2>

          <p>
            Follow {recipe.title} step by step
            while you cook.
          </p>

          {!supported && (
            <p
              className="voice-error"
              role="alert"
            >
              Voice guidance is not supported
              by this browser. Try a current
              version of Chrome, Edge, or Safari.
            </p>
          )}

          {message && (
            <p
              className="voice-error"
              role="alert"
            >
              {message}
            </p>
          )}

          <div className="language-options">
            <button
              type="button"
              disabled={
                !supported ||
                isTranslating
              }
              onClick={() =>
                chooseLanguage("en-IN")
              }
            >
              English
              <small>en-IN</small>
            </button>

            <button
              type="button"
              disabled={
                !supported ||
                isTranslating
              }
              onClick={() =>
                chooseLanguage("ta-IN")
              }
            >
              {isTranslating
                ? "Translating…"
                : "தமிழ்"}

              <small>ta-IN</small>
            </button>
          </div>
        </section>
      </div>
    );
  }

  // ==========================================
  // COOK MODE
  // ==========================================

  return (
    <div
      className="cook-modal-backdrop"
      role="presentation"
    >
      <section
        className="cook-mode"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cook-mode-title"
      >
        {/* ====================================
            HEADER
        ==================================== */}

        <header className="cook-mode-header">
          <div>
            <span className="eyebrow">
              COOK MODE
            </span>

            <h2 id="cook-mode-title">
              {recipe.title}
            </h2>
          </div>

          <button
            type="button"
            className="cook-close"
            onClick={() => {
              stop();
              onClose();
            }}
            aria-label="Exit Cook Mode"
          >
            <X />
          </button>
        </header>

        {/* ====================================
            PROGRESS
        ==================================== */}

        <div className="cook-progress">
          <span>
            Step {step + 1} of{" "}
            {instructions.length}
          </span>

          <div>
            <i
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        {/* ====================================
            CURRENT STEP
        ==================================== */}

        <article className="cook-current-step">
          <span>
            STEP {step + 1}
          </span>

          <p>
            {instructions[step]}
          </p>
        </article>

        {/* ====================================
            ERROR MESSAGE
        ==================================== */}

        {message && (
          <p
            className="voice-error"
            role="alert"
          >
            {message}
          </p>
        )}

        {/* ====================================
            PLAYBACK CONTROLS
        ==================================== */}

        <div className="cook-controls">

          {/* ----------------------------------
              PREVIOUS STEP
          ---------------------------------- */}

          <button
            type="button"
            onClick={() => {
              stop();

              setStep((current) =>
                Math.max(
                  0,
                  current - 1
                )
              );

              // Selecting/navigating to a
              // step means Play should play
              // only that step.
              setPlaybackMode("single");
            }}
            disabled={step === 0}
            aria-label="Previous step"
          >
            <ChevronLeft />
          </button>

          {/* ----------------------------------
              PLAY / PAUSE
          ---------------------------------- */}

          {status === "playing" ? (
            <button
              type="button"
              className="cook-play"
              onClick={() => {
                window.speechSynthesis.pause();

                setStatus("paused");
              }}
              aria-label="Pause"
            >
              <Pause />
            </button>
          ) : (
            <button
              type="button"
              className="cook-play"
              onClick={() => {
                // --------------------------------
                // RESUME PAUSED SPEECH
                // --------------------------------

                if (status === "paused") {
                  window.speechSynthesis.resume();

                  setStatus("playing");

                  return;
                }

                // --------------------------------
                // PLAY CURRENT STEP
                // --------------------------------
                //
                // The current playbackMode decides
                // whether this is:
                //
                // SINGLE
                // or
                // CONTINUOUS
                //

                speak(
                  step,
                  rate,
                  playbackMode
                );
              }}
              aria-label="Play"
            >
              <Play />
            </button>
          )}

          {/* ----------------------------------
              REPLAY FROM STEP 1
          ---------------------------------- */}

          <button
            type="button"
            onClick={() => {
              // Stop current speech.
              stop();

              // Always start from Step 1.
              setStep(0);

              // Replay always means
              // continuous playback.
              setPlaybackMode(
                "continuous"
              );

              // Start Step 1 after state update.
              window.setTimeout(() => {
                speak(
                  0,
                  rate,
                  "continuous"
                );
              }, 80);
            }}
            aria-label="Replay recipe from step 1"
          >
            <RotateCcw />
          </button>

          {/* ----------------------------------
              NEXT STEP
          ---------------------------------- */}

          <button
            type="button"
            onClick={() => {
              stop();

              setStep((current) =>
                Math.min(
                  instructions.length - 1,
                  current + 1
                )
              );

              // Selecting a particular step
              // means Play should play only
              // that step.
              setPlaybackMode("single");
            }}
            disabled={
              step ===
              instructions.length - 1
            }
            aria-label="Next step"
          >
            <ChevronRight />
          </button>

          {/* ----------------------------------
              STOP
          ---------------------------------- */}

          <button
            type="button"
            onClick={stop}
            aria-label="Stop voice guidance"
          >
            <Square />
          </button>
        </div>

        {/* ====================================
            SETTINGS
        ==================================== */}

        <div className="cook-settings">

          {/* ----------------------------------
              SPEED
          ---------------------------------- */}

          <label className="speed-control">
            Speed

            <select
              value={rate}
              onChange={(event) =>
                changeRate(
                  Number(
                    event.target.value
                  )
                )
              }
            >
              {speeds.map((speed) => (
                <option
                  value={speed}
                  key={speed}
                >
                  {speed}×
                </option>
              ))}
            </select>
          </label>

          {/* ----------------------------------
              VOICE
          ---------------------------------- */}

          {compatibleVoices.length >
            0 && (
            <label className="voice-control">
              Voice

              <select
                value={
                  voiceURI ||
                  selectedVoice?.voiceURI ||
                  ""
                }
                onChange={(event) =>
                  setVoiceURI(
                    event.target.value
                  )
                }
              >
                {compatibleVoices.map(
                  (voice) => (
                    <option
                      key={
                        voice.voiceURI
                      }
                      value={
                        voice.voiceURI
                      }
                    >
                      {voice.name}
                    </option>
                  )
                )}
              </select>
            </label>
          )}
        </div>

        {/* ====================================
            COMPLETE MESSAGE
        ==================================== */}

        {status === "complete" && (
          <p className="cook-complete">
            You’re all done — enjoy your meal.
          </p>
        )}

        {/* ====================================
            STEP LIST
        ==================================== */}

        <ol className="cook-step-list">
          {instructions.map(
            (instruction, index) => (
              <li
                key={`${index}-${instruction}`}
                className={
                  index === step
                    ? "active"
                    : ""
                }
              >
                <button
                  type="button"
                  onClick={() => {
                    // Stop any current speech.
                    stop();

                    // Select the clicked step.
                    setStep(index);

                    // IMPORTANT:
                    // Clicking a particular step
                    // switches playback to SINGLE
                    // mode.
                    //
                    // Therefore:
                    //
                    // Click Step 4
                    // Click Play
                    // → Step 4 only.
                    setPlaybackMode(
                      "single"
                    );
                  }}
                >
                  {index + 1}
                </button>

                <span>
                  {instruction}
                </span>
              </li>
            )
          )}
        </ol>
      </section>
    </div>
  );
}

export default CookMode;