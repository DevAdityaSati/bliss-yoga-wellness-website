import { ProgramItem, StatItem, FeatureItem, CoreValueItem, TestimonialItem, FAQItem } from '../types';

import heroImg from '../assets/images/male_handstand_beach_1784968054987.jpg';
import hathaImg from '../assets/images/hatha_yoga_session_1784962086450.jpg';
import chairImg from '../assets/images/chair_yoga_session_1784962104735.jpg';
import meditationImg from '../assets/images/guided_meditation_session_1784962121368.jpg';
import therapeuticImg from '../assets/images/therapeutic_yoga_session_1784962139940.jpg';
import bliss12Img from '../assets/images/bliss_transformation_12d_1785168143343.jpg';
import bliss15Img from '../assets/images/bliss_wellness_15d_1785168155915.jpg';

export { heroImg };

export const PROGRAMS: ProgramItem[] = [
  {
    id: '12-day-bliss-transformation',
    title: '12-Day Bliss Transformation Program',
    description: 'A 12-day structured wellness transformation covering Hatha Yoga, Chair Yoga, Guided Meditation, Pranayama, Posture Correction, Lower Back & Cervical Care, and Stress Management.',
    groupPrice: 180,
    privatePrice: 300,
    duration: '12 Days',
    is_premium: true,
    image: bliss12Img,
    benefits: [
      'Hatha Yoga',
      'Chair Yoga',
      'Guided Meditation',
      'Mindfulness',
      'Pranayama & Breathing Practices',
      'Relaxation Techniques',
      'Stress Management',
      'Posture Correction',
      'Lower Back Therapy',
      'Cervical Care',
      'Mobility Improvement',
      'Flexibility & Balance Training',
      'Strength Development',
      'Daily Practice Guidance',
      'Lifestyle Recommendations & Recovery',
    ],
    recommendedFor: 'Practitioners seeking a comprehensive 12-day guided transformation across physical posture, breath mastery, and mental peace.',
    overview:
      'The 12-Day Bliss Transformation Program is a complete structured regimen integrating Hatha Yoga, Chair Yoga, Guided Meditation, Mindfulness, Pranayama, Posture Correction, Lower Back Therapy, Cervical Care, Mobility, Flexibility, Balance, and Strength Development with daily lifestyle guidance and recovery.',
    suitableFor: [
      'Beginners',
      'Intermediate',
      'Advanced',
      'Working Professionals',
      'Seniors',
      'Recovery Practitioners',
    ],
    whatYouWillLearn: [
      'Structured daily Hatha & Chair Yoga movement sequences',
      'Guided meditation and diaphragmatic pranayama breath control',
      'Targeted posture correction and lumbar/cervical care routines',
      'Personalized daily practice guidance and sustainable lifestyle habits',
    ],
    classStructure: [
      'Daily 60-Min Structured Live Interactive Session',
      'Days 1-4: Foundation, Breathing & Posture Alignment',
      'Days 5-8: Core Strength, Spinal Therapy & Stress Relief',
      'Days 9-12: Total Body Balance, Meditation & Holistic Mastery',
    ],
    faqs: [
      {
        question: 'Is an account required to enroll in the 12-Day Program?',
        answer: 'Yes, a Student Account is required so you can track your 12 days of attendance, access live meeting links, and view schedule details in your Student Dashboard.',
      },
      {
        question: 'What is included in the 12-Day Transformation?',
        answer: 'All Bliss offerings are included: Hatha Yoga, Chair Yoga, Meditation, Mindfulness, Pranayama, Posture Correction, Spinal Care, Mobility, Balance, and Daily Lifestyle Guidance.',
      },
    ],
  },
  {
    id: '15-day-bliss-complete-wellness',
    title: '15-Day Bliss Complete Wellness Program',
    description: 'A 15-day complete holistic wellness journey designed for total body restoration, spinal care, breath mastery, strength, balance, and daily lifestyle transformation.',
    groupPrice: 220,
    privatePrice: 400,
    duration: '15 Days',
    is_premium: true,
    image: bliss15Img,
    benefits: [
      'Complete Hatha & Chair Yoga Regimen',
      'Deep Guided Meditation & Mindfulness',
      'Pranayama & Breathing Practice',
      'Relaxation & Nervous System Reset',
      'Ergonomic Posture & Alignment Care',
      'Comprehensive Lower Back & Cervical Therapy',
      'Mobility, Flexibility & Balance Training',
      'Strength Development & Core Stability',
      'Daily Practice Guidance & Recovery Sessions',
    ],
    recommendedFor: 'Anyone looking for an intensive 15-day holistic wellness program with individualized guidance, posture correction, and stress relief.',
    overview:
      'The 15-Day Bliss Complete Wellness Program offers an intensive, progressive 15-day path combining physical movement, breath control, guided meditation, posture alignment, spinal therapy, and functional strength development.',
    suitableFor: [
      'All Levels',
      'Desk workers suffering from posture strain',
      'Seniors seeking safe joint mobility',
      'Individuals needing spinal and cervical care',
    ],
    whatYouWillLearn: [
      'Advanced Hatha, Chair, and Therapeutic Yoga posture flows',
      'Deep pranayama and meditation methods for stress management',
      'Anatomical posture corrections for upper back, neck, and lumbar health',
      'Long-term lifestyle recommendations and restorative recovery habits',
    ],
    classStructure: [
      'Daily 60-Min Interactive Live Instruction',
      'Days 1-5: Gentle Awakening, Alignment & Stress Reset',
      'Days 6-10: Spinal Decompression, Core Stability & Mobility',
      'Days 11-15: Deep Breathwork, Balance & Holistic Transformation',
    ],
    faqs: [
      {
        question: 'How do I access the 15-Day Program after payment?',
        answer: 'Once your payment is completed and verified, the program activates automatically in your Student Dashboard with schedule details and live meeting links.',
      },
      {
        question: 'Can I choose between Group and Private formats?',
        answer: 'Yes! Group Sessions are $220 (Taxes Included) for 15 Days, while Private 1-on-1 Sessions are $400 for 15 Days.',
      },
    ],
  },
  {
    id: 'hatha-yoga',
    title: 'Hatha Yoga',
    description: 'Traditional yoga practice focusing on strength, flexibility, posture, balance, breathing, and mindfulness.',
    groupPrice: 20,
    privatePrice: 30,
    duration: '60 Minutes',
    image: hathaImg,
    benefits: [
      'Improves flexibility',
      'Builds strength',
      'Improves posture',
      'Better balance',
      'Better breathing',
      'Stress reduction',
      'Increased body awareness',
      'Greater confidence',
    ],
    recommendedFor: 'All levels seeking foundational strength, bodily harmony, and mental clarity.',
    overview:
      'Hatha Yoga combines physical postures, mindful breathing, and relaxation techniques to improve strength, flexibility, posture, and overall well-being. Every class emphasizes correct alignment, controlled movement, and sustainable progress suitable for all experience levels.',
    suitableFor: [
      'Beginners',
      'Intermediate',
      'Advanced',
      'Working professionals',
      'Students',
      'Adults of all ages',
    ],
    whatYouWillLearn: [
      'Anatomically sound postural alignment for fundamental asanas',
      'Controlled pranayama breathwork for energy regulation',
      'Mindful transitions to build functional core stability',
      'Deep muscular relaxation methods to ease physical fatigue',
    ],
    classStructure: [
      '10 Mins: Mindful Centering & Pranayama Breathing',
      '15 Mins: Gentle Warm-Up & Sun Salutations',
      '25 Mins: Standing & Seated Asana Sequence',
      '10 Mins: Deep Restorative Savasana & Integration',
    ],
    faqs: [
      {
        question: 'Is Hatha Yoga suitable for complete beginners?',
        answer: 'Absolutely! Hatha Yoga is the foundational style of yoga. Options and posture variations are provided for all experience levels.',
      },
      {
        question: 'How often should I practice Hatha Yoga?',
        answer: 'Practicing 2 to 3 times per week delivers noticeable improvements in flexibility, posture, and mental calm.',
      },
    ],
  },
  {
    id: 'chair-yoga',
    title: 'Chair Yoga',
    description: 'Gentle yoga designed for seniors, beginners, and people with limited mobility.',
    groupPrice: 20,
    privatePrice: 30,
    duration: '60 Minutes',
    image: chairImg,
    benefits: [
      'Improved circulation',
      'Joint mobility',
      'Better posture',
      'Improved balance',
      'Reduced stiffness',
      'Gentle strengthening',
    ],
    recommendedFor: 'Seniors, desk professionals, and practitioners rebuilding joint mobility safely.',
    overview:
      'Chair Yoga is a gentle practice that makes yoga accessible for seniors, beginners, office workers, and individuals with limited mobility. Classes focus on safe movement, joint mobility, flexibility, balance, and relaxation.',
    suitableFor: ['Seniors', 'Beginners', 'Limited mobility', 'Office workers'],
    whatYouWillLearn: [
      'Seated spinal decompression techniques',
      'Gentle shoulder, neck, and ankle mobility exercises',
      'Safe leg strengthening using chair support for balance',
      'Restorative breathwork for stress and stiffness reduction',
    ],
    classStructure: [
      '10 Mins: Seated Breathing & Posture Alignment',
      '20 Mins: Gentle Upper Body & Joint Mobility Drills',
      '20 Mins: Supported Standing & Seated Balance Work',
      '10 Mins: Soothing Guided Seated Relaxation',
    ],
    faqs: [
      {
        question: 'What kind of chair is needed for class?',
        answer: 'Any sturdy dining or office chair without wheels or armrests works perfectly.',
      },
      {
        question: 'Is Chair Yoga effective for office workers?',
        answer: 'Yes! It directly counteracts desk fatigue, neck tightness, and poor sitting posture.',
      },
    ],
  },
  {
    id: 'guided-meditation',
    title: 'Guided Meditation & Mindfulness',
    description: 'Develop calmness, emotional balance, focus, and mindfulness through guided meditation.',
    groupPrice: 20,
    privatePrice: 30,
    duration: '60 Minutes',
    image: meditationImg,
    benefits: [
      'Better concentration',
      'Reduced stress',
      'Better sleep',
      'Emotional balance',
      'Mental clarity',
      'Relaxation',
    ],
    recommendedFor: 'Busy professionals, students, and anyone experiencing burnout or high mental stress.',
    overview:
      'Learn breathing techniques, mindfulness practices, guided meditation, and relaxation methods that help improve focus, emotional balance, stress management, and overall mental well-being.',
    suitableFor: [
      'All experience levels',
      'High stress professionals',
      'Students',
      'Anyone seeking mental calmness',
    ],
    whatYouWillLearn: [
      'Scientific diaphragmatic breath control to soothe the nervous system',
      'Mindfulness techniques to observe thoughts without attachment',
      'Body scan practices to dissolve unconscious physical tension',
      'Daily routines for sustained mental clarity and restful sleep',
    ],
    classStructure: [
      '10 Mins: Gentle Breathwork & Intention Setting',
      '35 Mins: Guided Visualization & Mindfulness Practice',
      '15 Mins: Quiet Reflection & Integration Guidance',
    ],
    faqs: [
      {
        question: 'What if my mind wanders during meditation?',
        answer: 'Wandering thoughts are completely normal! Our guided cues gently redirect your focus back to the present moment without judgment.',
      },
      {
        question: 'Do I need to sit on the floor?',
        answer: 'No, you may meditate comfortably in a chair, on a cushion, or even lying down.',
      },
    ],
  },
  {
    id: 'therapeutic-yoga',
    title: 'Therapeutic Yoga',
    description: 'Support lower back pain, posture improvement, mobility, flexibility, and stress reduction.',
    groupPrice: 20,
    privatePrice: 30,
    duration: '60 Minutes',
    image: therapeuticImg,
    benefits: [
      'Improved mobility',
      'Better posture',
      'Reduced discomfort',
      'Flexibility',
      'Relaxation',
    ],
    supports: ['Lower Back', 'Neck', 'Shoulders', 'Stress Management'],
    recommendedFor: 'Individuals recovering from chronic tension, back stiffness, posture issues, or joint discomfort.',
    overview:
      'Therapeutic Yoga focuses on gentle movement and proper alignment to improve mobility, relieve muscular tension, support posture, and promote overall wellness through individualized practice.',
    suitableFor: [
      'Lower back discomfort',
      'Neck & shoulder stiffness',
      'Postural strain',
      'Stress management & recovery',
    ],
    whatYouWillLearn: [
      'Gentle spinal decompression and pelvic alignment principles',
      'Postural corrections to relieve desk-bound muscle tightness',
      'Restorative postures utilizing props for deep muscular release',
      'Breath synchronization to calm pain responses in the nervous system',
    ],
    classStructure: [
      '10 Mins: Posture Assessment & Gentle Breath Sync',
      '25 Mins: Targeted Anatomical Stretches for Back & Shoulders',
      '15 Mins: Core & Pelvic Stabilization Alignment',
      '10 Mins: Deep Restorative Unwinding',
    ],
    faqs: [
      {
        question: 'Is Therapeutic Yoga safe if I have lower back pain?',
        answer: 'Yes! Classes are specially designed with slow, gentle movements and individual modifications to relieve lumbar tension safely.',
      },
      {
        question: 'Is this class strenuous?',
        answer: 'No, Therapeutic Yoga is gentle, slow-paced, and prioritized around safety, comfort, and restoration.',
      },
    ],
  },
];

export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'test-1',
    name: 'Elena Rostova',
    country: 'Canada',
    program: 'Therapeutic Yoga',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250&h=250',
    testimonial:
      'As a software developer sitting for 10 hours a day, I struggled with persistent lower back stiffness. Therapeutic Yoga with Bliss transformed my daily comfort completely. The live alignment feedback is as precise as being in a studio.',
  },
  {
    id: 'test-2',
    name: 'Kenji Takahashi',
    country: 'Japan',
    program: 'Hatha Yoga',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250&h=250',
    testimonial:
      'Practicing Hatha Yoga live across my local time zone in Tokyo has brought immense physical balance and focus to my routine. The instructor’s verbal cues are remarkably clear and encouraging.',
  },
  {
    id: 'test-3',
    name: 'Amara Okafor',
    country: 'United Kingdom',
    program: 'Guided Meditation & Mindfulness',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250&h=250',
    testimonial:
      'The guided meditation sessions helped me navigate intense workplace stress and restored my sleep quality within three weeks. It is now the most cherished hour of my week.',
  },
  {
    id: 'test-4',
    name: 'Mateo Silva',
    country: 'Brazil',
    program: 'Hatha Yoga',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250&h=250',
    testimonial:
      'I was hesitant as a complete beginner, but the atmosphere is warm and non-judgmental. My core strength and posture have improved significantly.',
  },
  {
    id: 'test-5',
    name: 'Sarah Jenkins',
    country: 'Australia',
    program: 'Chair Yoga',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250&h=250',
    testimonial:
      'At 68, I suffered from knee stiffness. Chair Yoga gave me back my confidence in daily movement without putting stress on my joints. Highly recommended!',
  },
  {
    id: 'test-6',
    name: 'David Miller',
    country: 'United States',
    program: 'Therapeutic Yoga',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=250&h=250',
    testimonial:
      'The private 1-on-1 sessions were tailored specifically to my shoulder rehab goals. The level of individual care and progression tracking is top-tier.',
  },
  {
    id: 'test-7',
    name: 'Fatima Al-Mansoor',
    country: 'United Arab Emirates',
    program: 'Guided Meditation & Mindfulness',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=250&h=250',
    testimonial:
      'Being able to tune in to live online meditation that perfectly matches my local schedule in Dubai has been a blessing. Deeply calming and grounding.',
  },
  {
    id: 'test-8',
    name: 'Sophia Dupont',
    country: 'France',
    program: 'Hatha Yoga',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=250&h=250',
    testimonial:
      'A truly global community with expert instruction. The small group class size ensures everyone gets real-time corrections and personal attention every session.',
  },
];

export const FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Who can join?',
    answer:
      'Anyone! Our online yoga studio warmly welcomes practitioners of all ages, body types, fitness levels, and physical backgrounds from every country in the world.',
    category: 'General',
  },
  {
    id: 'faq-2',
    question: 'Do I need previous yoga experience?',
    answer:
      'No previous experience is needed. All our programs—including Hatha Yoga, Chair Yoga, Guided Meditation, and Therapeutic Yoga—offer clear, step-by-step modifications suitable for complete beginners.',
    category: 'Practice',
  },
  {
    id: 'faq-3',
    question: 'How do online classes work?',
    answer:
      'Classes are conducted live over high-definition interactive video stream. You can see and hear your instructor clearly, and receive real-time verbal alignment cues and posture guidance throughout the session.',
    category: 'Online Experience',
  },
  {
    id: 'faq-4',
    question: 'What equipment do I need?',
    answer:
      'For most classes, all you need is a comfortable yoga mat and water. For Chair Yoga, a sturdy chair without wheels or armrests is used. Optional props like yoga blocks, a strap, or cushions can enhance comfort.',
    category: 'Preparation',
  },
  {
    id: 'faq-5',
    question: 'Can I join from any country?',
    answer:
      'Yes, absolutely! We welcome practitioners globally. When booking, our platform automatically detects your local time zone so class times align effortlessly with your local clock.',
    category: 'General',
  },
  {
    id: 'faq-6',
    question: 'Can beginners join?',
    answer:
      'Yes, beginners are warmly encouraged to join any class format. Our instructor provides accessible variations and gentle guidance so you can move comfortably at your own pace.',
    category: 'Practice',
  },
  {
    id: 'faq-7',
    question: 'Do private sessions follow a personalized plan?',
    answer:
      'Yes! Private 1-on-1 sessions begin with a brief consultation about your specific health goals, mobility needs, or posture goals. Sequences are customized exclusively for your body.',
    category: 'Private Classes',
  },
  {
    id: 'faq-8',
    question: 'How do I book?',
    answer:
      'Simply click any "Book Session" button across the website, choose your preferred program, select Group or Private format, pick your date and local time, and submit your reservation.',
    category: 'Booking',
  },
];

export const TRUST_STATS: StatItem[] = [
  {
    id: 'exp',
    value: '5+',
    label: 'Years Experience',
    subtext: 'Dedicated teaching in Hatha, Chair & Therapeutic Yoga',
    iconName: 'Award',
  },
  {
    id: 'students',
    value: '1000+',
    label: 'Students Guided',
    subtext: 'Guiding dedicated practitioners across 120+ countries worldwide',
    iconName: 'Users',
  },
  {
    id: 'levels',
    value: 'All Levels',
    label: 'Beginner to Advanced',
    subtext: 'Carefully tailored progressions for every body and lifestyle',
    iconName: 'Sparkles',
  },
  {
    id: 'international',
    value: 'Global',
    label: 'International Sessions',
    subtext: 'Seamless live online instruction adapted to your local time zone',
    iconName: 'Globe',
  },
  {
    id: 'format',
    value: 'Flexible',
    label: 'Private & Group Classes',
    subtext: 'Interactive live video with direct instructor correction',
    iconName: 'HeartHandshake',
  },
];

export const WHY_CHOOSE_FEATURES: FeatureItem[] = [
  {
    id: 'guidance',
    title: 'Personalized Guidance',
    description: 'Every body is unique. Classes adapt to your anatomy, personal goals, and current energy levels.',
    iconName: 'Compass',
  },
  {
    id: 'professional',
    title: 'Professional Teaching',
    description: 'Over 5 years of certified expertise guaranteeing refined, anatomically sound instruction.',
    iconName: 'GraduationCap',
  },
  {
    id: 'small-groups',
    title: 'Small Group Sessions',
    description: 'Intimate online class sizes ensuring individual attention and personal posture feedback.',
    iconName: 'UserCheck',
  },
  {
    id: 'private-sessions',
    title: 'Private Sessions',
    description: 'One-on-one tailored practices designed around specific health goals, stress relief, or recovery.',
    iconName: 'ShieldCheck',
  },
  {
    id: 'flexible',
    title: 'Global Flexible Scheduling',
    description: 'Live morning, afternoon, and evening slots designed to fit international time zones worldwide.',
    iconName: 'Calendar',
  },
  {
    id: 'mind-body',
    title: 'Mind-Body Wellness',
    description: 'Integrates physical alignment with deep breathwork to harmonize body and nervous system.',
    iconName: 'Sun',
  },
  {
    id: 'alignment',
    title: 'Correct Alignment',
    description: 'Emphasis on subtle bio-mechanics to prevent injury and deepen organic range of motion.',
    iconName: 'Activity',
  },
  {
    id: 'safe-practice',
    title: 'Safe Practice for All',
    description: 'Thoughtful posture variations provided for beginners, seniors, working professionals, and injury recovery.',
    iconName: 'Heart',
  },
  {
    id: 'live-interactive',
    title: 'Live Interactive Classes',
    description: 'Real-time video feedback, verbal cues, and posture adjustments in every single class.',
    iconName: 'Video',
  },
];

export const CORE_VALUES: CoreValueItem[] = [
  {
    id: 'authenticity',
    title: 'Authenticity',
    description: 'Rooted in traditional yoga wisdom while remaining practical and relevant for modern living.',
    iconName: 'Flower2',
  },
  {
    id: 'compassion',
    title: 'Compassion',
    description: 'Creating a welcoming, non-judgmental space where every student is met with empathy and patience.',
    iconName: 'Heart',
  },
  {
    id: 'guidance',
    title: 'Professional Guidance',
    description: 'Delivering clear, precise, and anatomically conscious instruction grounded in continuous study.',
    iconName: 'CheckCircle2',
  },
  {
    id: 'mindful-living',
    title: 'Mindful Living',
    description: 'Encouraging mindfulness beyond the mat into daily conversations, work, and restful sleep.',
    iconName: 'Feather',
  },
  {
    id: 'continuous-growth',
    title: 'Continuous Growth',
    description: 'Supporting steady, sustainable physical and mental growth at your own comfortable pace.',
    iconName: 'TrendingUp',
  },
  {
    id: 'inclusivity',
    title: 'Inclusivity',
    description: 'Welcoming practitioners of every age, background, body type, mobility level, and background.',
    iconName: 'Users',
  },
  {
    id: 'safety',
    title: 'Safety',
    description: 'Prioritizing proper biomechanics, alignment, and joint longevity in every sequence.',
    iconName: 'Shield',
  },
  {
    id: 'excellence',
    title: 'Excellence',
    description: 'Striving for highest quality in studio atmosphere, audio clarity, and client communication.',
    iconName: 'Star',
  },
];
