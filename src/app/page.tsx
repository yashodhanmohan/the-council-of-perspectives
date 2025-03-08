'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  LLM,
  LLM_NAMES,
  PERSONALITIES,
  Personality,
  Profession,
  PROFESSION_NAMES,
  getPersonalitiesForProfession,
  getRandomPersonalities,
  FAMOUS_PERSONALITIES,
} from '@/lib/constants';
import { useEffect, useState, useRef } from 'react';
import { SettingsDialog } from '@/components/settings-dialog';
import { ChatClient } from '@/lib/llm/chat-client';
import { AnthropicClient } from '@/lib/llm/anthropic';
import { LLMOrchestrator } from '@/lib/orchestration/llm-orchestrator';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';

interface Participant {
  llm: LLM;
  personality: Personality;
  famousPersonality: { name: string; description: string };
  messages?: Array<{ content: string; index: number }>;
  isThinking?: boolean;
}

const MAX_TURNS = 5;
const MIN_TURNS = 1;

export default function Home() {
  const [profession, setProfession] = useState<Profession>(Profession.ENGINEERING);
  const [problemStatement, setProblemStatement] = useState('');
  const [isDiscussing, setIsDiscussing] = useState(false);
  const responseIndexRef = useRef(0);
  const isDiscussingRef = useRef(false);
  const [participants, setParticipants] = useState<Participant[]>([
    {
      llm: LLM.CLAUDE,
      personality: Object.keys(PERSONALITIES[Profession.ENGINEERING])[0] as Personality,
      famousPersonality: FAMOUS_PERSONALITIES[Profession.ENGINEERING][0],
    },
    {
      llm: LLM.CLAUDE,
      personality: Object.keys(PERSONALITIES[Profession.ENGINEERING])[1] as Personality,
      famousPersonality: FAMOUS_PERSONALITIES[Profession.ENGINEERING][1],
    },
    {
      llm: LLM.CLAUDE,
      personality: Object.keys(PERSONALITIES[Profession.ENGINEERING])[2] as Personality,
      famousPersonality: FAMOUS_PERSONALITIES[Profession.ENGINEERING][2],
    },
  ]);
  const [turnsPerEngineer, setTurnsPerEngineer] = useState(1);

  // Initialize random personalities after first render
  useEffect(() => {
    const initialFamousPersonalities = getRandomPersonalities(Profession.ENGINEERING, 3);
    setParticipants((prev) =>
      prev.map((participant, i) => ({
        ...participant,
        famousPersonality: initialFamousPersonalities[i],
      }))
    );
  }, []); // Empty dependency array means this runs once after mount

  useEffect(() => {
    // Skip the first render since we handle it in the initialization effect
    if (profession === Profession.ENGINEERING) return;

    const famousPersonalities = getRandomPersonalities(profession, 3);
    // Get the valid personalities for the selected profession
    const availablePersonalities = Object.keys(PERSONALITIES[profession]);

    // Ensure we only use personalities that exist for this profession
    const validPersonalitiesForProfession = availablePersonalities.slice(0, 3);

    setParticipants((prev) =>
      prev.map((participant, i) => ({
        ...participant,
        // Reset LLM to CLAUDE since it's currently our only option
        llm: LLM.CLAUDE,
        // Assign new famous personality
        famousPersonality: famousPersonalities[i],
        // Use a valid personality for this profession
        personality: validPersonalitiesForProfession[i] as Personality,
      }))
    );

    // Update document title
    document.title = `The Council of ${PROFESSION_NAMES[profession]} - AI Expert Discussions`;
  }, [profession]);

  const updateParticipant = (index: number, field: keyof Participant, value: LLM | Personality) => {
    setParticipants((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const availablePersonalities = getPersonalitiesForProfession(profession);

  // Add this near the top of the component with other refs
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add this after other useEffects
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Create a dependency string for message lengths
  const messageLengthsKey = participants.map((p) => p.messages?.length).join(',');

  // Add this useEffect to scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messageLengthsKey]); // Scroll when any participant's messages change

  // Add this function to update thinking state
  const setParticipantThinking = (index: number, isThinking: boolean) => {
    setParticipants((prev) => prev.map((p, i) => (i === index ? { ...p, isThinking } : p)));
  };

  // Modify the orchestrator callback in handleSubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemStatement.trim()) return;

    setIsDiscussing(true);
    isDiscussingRef.current = true;

    try {
      const clients = new Map();
      const turnOrder = Array(turnsPerEngineer)
        .fill(participants)
        .flat()
        .map((p) => p.llm.toLowerCase());

      participants.forEach((participant) => {
        clients.set(participant.llm.toLowerCase(), new AnthropicClient(participant.personality));
      });

      const orchestrator = new LLMOrchestrator(
        clients,
        turnOrder,
        (response, index, thinking, messageIndex) => {
          const participantIndex = index % participants.length;

          if (thinking) {
            setParticipantThinking(participantIndex, true);
          } else {
            setParticipants((prev) => {
              const participantIndex = index % prev.length;
              return prev.map((p, i) =>
                i === participantIndex
                  ? {
                      ...p,
                      isThinking: false,
                      messages: [...(p.messages || []), ...(response ? [{ content: response.content, index: messageIndex }] : [])],
                    }
                  : p
              );
            });
          }
        },
        profession
      );

      await orchestrator.startConversation(problemStatement);
      setProblemStatement('');
    } catch (error) {
      console.error('Error in discussion:', error);
    } finally {
      isDiscussingRef.current = false;
      setIsDiscussing(false);
      setParticipants((prev) => prev.map((p) => ({ ...p, isThinking: false })));
    }
  };

  // Fix the event type in the Input component
  const handleTurnsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTurnsPerEngineer(Math.min(MAX_TURNS, Math.max(MIN_TURNS, parseInt(e.target.value) || 1)));
  };

  return (
    <div className="relative min-h-screen">
      {/* Spotlights */}
      <div
        className="fixed bottom-0 left-0 w-[60vw] h-[60vw] rounded-full blur-[150px] animate-[pulse_4s_ease-in-out_infinite,colorRotate_14s_linear_infinite] -z-10"
        style={{ transform: 'translate(-25%, 25%)' }}
      />
      <div
        className="fixed bottom-0 right-0 w-[60vw] h-[60vw] rounded-full blur-[150px] animate-[pulse_4s_ease-in-out_infinite_1s,colorRotate_14s_linear_infinite_-7s] -z-10"
        style={{ transform: 'translate(25%, 25%)' }}
      />

      <div className="min-h-screen p-8 flex flex-col gap-8">
        <SettingsDialog />
        {/* Header */}
        <header className="text-center mb-4">
          <h1 className="relative inline-block text-5xl font-bold mb-3 text-white">
            <span className="relative">
              {/* Glow effect */}
              <span className="absolute inset-0 blur-lg bg-blue-500/20 rounded-full" />

              {/* Main text with gradient */}
              <span className="relative bg-gradient-to-b from-white via-blue-100 to-blue-200 text-transparent bg-clip-text drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                The Council of {PROFESSION_NAMES[profession]}
              </span>
            </span>
          </h1>
          <p className="text-white/80 text-lg">A council of AI experts discussing solutions from different perspectives</p>
          <div className="mt-4 flex flex-col justify-center items-center gap-4">
            <Select value={profession} onValueChange={(value) => setProfession(value as Profession)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select profession" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(Profession).map((prof) => (
                  <SelectItem key={prof} value={prof}>
                    {PROFESSION_NAMES[prof]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1 w-[200px] justify-between">
              <label htmlFor="turnsPerEngineer" className="text-sm text-blue-200 whitespace-nowrap">
                Turns per LLM:
              </label>
              <Input
                id="turnsPerEngineer"
                type="number"
                min={MIN_TURNS}
                max={MAX_TURNS}
                value={turnsPerEngineer}
                onChange={handleTurnsChange}
                className="w-16 text-center bg-blue-950/50"
              />
            </div>
          </div>
        </header>

        {/* Three column layout for LLM selections */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {participants.map((participant, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 bg-black text-card-foreground flex flex-col border-blue-500/50 shadow-[0_0_15px_-3px_rgba(59,130,246,0.4)] hover:shadow-[0_0_20px_-3px_rgba(59,130,246,0.5)]"
            >
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-white drop-shadow-[0_0_3px_rgba(255,255,255,0.3)]">
                      {participant.famousPersonality.name}
                    </h2>
                    <p className="text-xs text-blue-200">{participant.famousPersonality.description}</p>
                  </div>
                  <Select value={participant.llm} onValueChange={(value) => updateParticipant(index, 'llm', value as LLM)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Select LLM" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(LLM).map((llm) => (
                        <SelectItem key={llm} value={llm}>
                          {LLM_NAMES[llm]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Select value={participant.personality} onValueChange={(value) => updateParticipant(index, 'personality', value as Personality)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select personality" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(availablePersonalities).map(([key, { title, description }]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex flex-col items-start w-full">
                          <span className="text-white">{title}</span>
                          <span className="text-xs text-blue-200 block w-full">{description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>

        {/* Single conversation box */}
        <div className="flex-1 border rounded-lg p-4 bg-black text-card-foreground border-blue-500/50 shadow-[0_0_15px_-3px_rgba(59,130,246,0.4)] mb-6">
          <div className="space-y-4 bg-black rounded-md p-4 border border-blue-500/20">
            {participants.some((p) => p.messages?.length) || isDiscussing ? (
              <div className="space-y-6">
                {/* Flatten all messages and sort by their index in the responses array */}
                {participants
                  .flatMap((participant, participantIndex) =>
                    (participant.messages || []).map((message) => ({
                      participantIndex,
                      message: message.content,
                      messageIndex: message.index,
                    }))
                  )
                  .sort((a, b) => a.messageIndex - b.messageIndex)
                  .map(({ participantIndex, message }, index) => (
                    <div key={`${participantIndex}-${index}`} className="flex gap-3">
                      <Image
                        src={`https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_${(participantIndex + 1) * 7}.png`}
                        alt="Avatar"
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="text-xs text-blue-200 mb-1">{participants[participantIndex].famousPersonality.name}</div>
                        <div className="text-sm text-white/90">
                          <div className="prose prose-invert prose-sm prose-p:my-1 prose-p:text-white/90 prose-headings:text-white prose-strong:text-white prose-code:text-blue-300 prose-pre:bg-blue-950/30 prose-pre:text-white/90 max-w-none">
                            <ReactMarkdown>{message}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                {isDiscussing &&
                  participants.map(
                    (participant, index) =>
                      participant.isThinking && (
                        <div key={`thinking-${index}`} className="flex gap-3">
                          <Image
                            src={`https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_${(index + 1) * 7}.png`}
                            alt="Avatar"
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="text-xs text-blue-200 mb-1">{participant.famousPersonality.name}</div>
                            <p className="text-sm italic animate-[thinkingGlow_1.5s_ease-in-out_infinite]">Thinking...</p>
                          </div>
                        </div>
                      )
                  )}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <p className="text-sm text-white/70 italic text-center">Waiting for discussion to start...</p>
            )}
          </div>
        </div>

        {/* Problem statement form */}
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex flex-col gap-2">
            <label htmlFor="problemStatement" className="text-sm font-medium text-white/90">
              Problem statement
            </label>
            {isDiscussing ? (
              <div className="min-h-[120px] w-full rounded-lg border border-blue-500/20 bg-blue-950/20 backdrop-blur-sm px-4 py-3 text-sm text-white/90 shadow-[0_0_15px_-3px_rgba(59,130,246,0.2)]">
                {problemStatement}
              </div>
            ) : (
              <textarea
                id="problemStatement"
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                placeholder="Describe your engineering challenge or question here. For example: 'What's the best way to implement caching in a distributed system?'"
                className="min-h-[120px] w-full rounded-lg border border-blue-500/20 bg-blue-950/20 backdrop-blur-sm px-4 py-3 text-sm ring-offset-background placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-[0_0_15px_-3px_rgba(59,130,246,0.2)] hover:shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)] transition-shadow duration-300 text-white/90 resize-none"
              />
            )}
            <div className="flex justify-end mt-2">
              {isDiscussing ? (
                <Button
                  className="bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-red-500/50 transition-all duration-300 hover:scale-105"
                  onClick={() => {
                    isDiscussingRef.current = false;
                    setIsDiscussing(false);
                  }}
                >
                  Stop Discussion
                </Button>
              ) : (
                <Button
                  className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                  onClick={handleSubmit}
                  disabled={!problemStatement.trim()}
                >
                  Start Discussion
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
