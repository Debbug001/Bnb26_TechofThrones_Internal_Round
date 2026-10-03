import { AIMessage, SessionData } from '../types';

export const SUGGESTED_PROMPTS = [
  'Summarize this meeting',
  "Summarize Rahul's contributions",
  'What decisions were made?',
  'What did Priya suggest?',
  'List action items',
  'Explain the technical discussion simply',
];

export function generateMockAIResponse(
  query: string,
  session: SessionData
): AIMessage {
  const normalized = query.toLowerCase().trim();
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Overall Summary
  if (
    normalized.includes('summarize this meeting') ||
    normalized.includes('overall summary') ||
    normalized.includes('meeting summary') ||
    normalized.includes('overview')
  ) {
    return {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      timestamp,
      structuredType: 'summary',
      content:
        'This session focused on finalizing the core multi-device conversation architecture, reviewing UI readiness, and confirming low-latency audio synchronization across nearby devices.',
      sections: [
        {
          title: 'Key Objectives & Consensus',
          points: [
            'Alice proposed locking in the distributed conversation architecture immediately.',
            'Rahul verified the WebSocket packet framing layer and reported reliable local network transmission.',
            'Priya audited the interface design, verifying high-contrast legibility and instantaneous speaker identification.',
          ],
          timestampBadge: '10:24 AM – 10:25 AM',
        },
        {
          title: 'Acoustic Performance',
          points: [
            'Multi-device latency stayed strictly beneath the target budget (< 14ms).',
            'Dynamic proximity weighting successfully routed the cleanest microphone feed without echo cancellation artifacts.',
          ],
          timestampBadge: '10:25 AM',
        },
      ],
      citations: [
        {
          timestamp: '10:24 AM',
          speaker: 'Alice',
          snippet: 'We should finalize the architecture today.',
        },
        {
          timestamp: '10:24 AM',
          speaker: 'Rahul',
          snippet: "I'll handle the backend integration.",
        },
        {
          timestamp: '10:25 AM',
          speaker: 'Priya',
          snippet: "Let's review the UI before deployment.",
        },
      ],
    };
  }

  // 2. Rahul's Contributions
  if (
    normalized.includes('rahul') ||
    normalized.includes("rahul's contributions") ||
    normalized.includes('backend')
  ) {
    return {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      timestamp,
      structuredType: 'speaker_summary',
      content:
        "Rahul took direct ownership of the backend integration, network packet framing, and the deployment pipeline.",
      sections: [
        {
          title: "Rahul's Key Statements & Responsibilities",
          points: [
            'Committed to leading backend integration and WebSocket message coordination [10:24 AM].',
            'Benchmarked packet transmission over Wi-Fi and Bluetooth, confirming rock-solid performance [10:25 AM].',
            'Confirmed the absence of echo cancellation degradation and audio clipping [10:25 AM].',
            'Scheduled the staging environment deployment to happen immediately following this conversation.',
          ],
          timestampBadge: '10:24 AM – 10:25 AM',
        },
      ],
      citations: [
        {
          timestamp: '10:24 AM',
          speaker: 'Rahul',
          snippet: "I'll handle the backend integration.",
        },
        {
          timestamp: '10:25 AM',
          speaker: 'Rahul',
          snippet: 'That gives our speaker diarization model plenty of headroom for clean attribution.',
        },
      ],
    };
  }

  // 3. Decisions Made
  if (
    normalized.includes('decision') ||
    normalized.includes('decisions were made') ||
    normalized.includes('what was decided')
  ) {
    return {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      timestamp,
      structuredType: 'decisions',
      content:
        'The team reached unanimous agreement on architecture sign-off, latency thresholds, and pre-deployment design standards.',
      sections: [
        {
          title: 'Agreed Decisions',
          points: [
            'Architecture Finalization: Architecture is locked in and will not undergo further structural changes before launch [10:24 AM].',
            'Latency SLA: Enforce a strict sub-20ms audio synchronization budget across all concurrent client streams.',
            'Staging Release: Proceed with deployment to staging today with full speaker diarization enabled.',
            'Visual Standards: Verify high-contrast typography and instant attribution feedback before production sign-off.',
          ],
          timestampBadge: '10:24 AM – 10:25 AM',
        },
      ],
      citations: [
        {
          timestamp: '10:24 AM',
          speaker: 'Alice',
          snippet: 'We should finalize the architecture today.',
        },
        {
          timestamp: '10:25 AM',
          speaker: 'Priya',
          snippet: "Let's review the UI before deployment.",
        },
      ],
    };
  }

  // 4. Priya's Suggestions
  if (
    normalized.includes('priya') ||
    normalized.includes("priya's") ||
    normalized.includes('what did priya suggest')
  ) {
    return {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      timestamp,
      structuredType: 'speaker_summary',
      content:
        'Priya focused on frontend user experience, legibility, and post-session workflow efficiency.',
      sections: [
        {
          title: "Priya's Contributions & Feedback",
          points: [
            'Recommended conducting a comprehensive UI and design review prior to staging release [10:25 AM].',
            'Validated that transcript flow, typographic contrast, and readability satisfy accessibility benchmarks.',
            'Confirmed that instantaneous speaker attribution feedback gives participants immediate conversational confidence.',
            'Noted that conversation summaries must be ready for export as soon as a meeting concludes.',
          ],
          timestampBadge: '10:25 AM',
        },
      ],
      citations: [
        {
          timestamp: '10:25 AM',
          speaker: 'Priya',
          snippet: "Let's review the UI before deployment.",
        },
        {
          timestamp: '10:25 AM',
          speaker: 'Priya',
          snippet: 'The transcript flow looks crisp. Contrast and typography pass all legibility checks.',
        },
      ],
    };
  }

  // 5. Action Items
  if (
    normalized.includes('action item') ||
    normalized.includes('action items') ||
    normalized.includes('todo') ||
    normalized.includes('tasks')
  ) {
    return {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      timestamp,
      structuredType: 'action_items',
      content:
        'Here are the concrete action items assigned during the conversation:',
      sections: [
        {
          title: 'Assigned Action Items',
          points: [
            '[Alice] Complete and publish the finalized architecture documentation to the team repository [10:24 AM].',
            '[Rahul] Deploy the backend integration build with WebSocket packet framing to the staging server [10:24 AM].',
            '[Priya] Perform final visual review and accessibility audit of the live caption layout [10:25 AM].',
            '[Host] Validate acoustic spatial capture performance across multi-device hardware in the test lab.',
          ],
          timestampBadge: '10:24 AM – 10:25 AM',
        },
      ],
      citations: [
        {
          timestamp: '10:24 AM',
          speaker: 'Alice',
          snippet: 'We should finalize the architecture today.',
        },
        {
          timestamp: '10:24 AM',
          speaker: 'Rahul',
          snippet: "I'll handle the backend integration.",
        },
      ],
    };
  }

  // 6. Technical Explanation
  if (
    normalized.includes('technical') ||
    normalized.includes('simply') ||
    normalized.includes('explain') ||
    normalized.includes('how does it work')
  ) {
    return {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      timestamp,
      structuredType: 'qa',
      content:
        'In plain terms: instead of relying on one distant microphone, Roundtable connects every phone and laptop on the table into a coordinated team of ears.',
      sections: [
        {
          title: 'How It Works (Simplified)',
          points: [
            'Multi-Angle Listening: When anyone speaks, whichever device is physically closest captures the clearest sound waves without room echo [10:25 AM].',
            'Ultra-Fast Sync: The devices synchronize their audio streams with less than 14 milliseconds of delay—faster than the blink of an eye [10:25 AM].',
            'Automatic Speaker Recognition: Because the system knows which microphone heard the voice first and loudest, it automatically labels who said what with high precision.',
          ],
          timestampBadge: '10:25 AM',
        },
      ],
      citations: [
        {
          timestamp: '10:25 AM',
          speaker: 'Alice',
          snippet: 'The multi-device audio sync latency is staying consistently below 14ms across the room.',
        },
      ],
    };
  }

  // 7. General Contextual Query Fallback
  return {
    id: `ai-${Date.now()}`,
    role: 'assistant',
    timestamp,
    structuredType: 'qa',
    content: `Based on the transcript for "${session.sessionName}", here is what was discussed regarding your question:`,
    sections: [
      {
        title: 'Meeting Insight',
        points: [
          `Participants (${session.participants.map((p) => p.name).join(', ')}) discussed architecture readiness, frontend reviews, and spatial multi-device audio capture.`,
          `The conversation recorded ${session.captions.length} statements with real-time speaker attribution.`,
          'Alice and Rahul confirmed the architecture and backend readiness, while Priya confirmed the user interface passes all quality criteria.',
        ],
        timestampBadge: '10:24 AM – 10:25 AM',
      },
    ],
    citations: session.captions.slice(0, 2).map((c) => ({
      timestamp: c.timestamp,
      speaker: c.speakerName,
      snippet: c.text,
    })),
  };
}
