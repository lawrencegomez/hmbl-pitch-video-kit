// Launch sampler: every launch part in one ~33 s film for a made-up product ("Example", example.com is a reserved
// demo domain). Shape from the teardown: promise -> one real task -> features -> proof number -> limits -> who -> logo.
import React from 'react';
import {Audio, getStaticFiles, staticFile} from 'remotion';
import {LOOKS, LF, sec, useLook} from './theme';
import {AppIcon, Beat, Stage, Bubble, ChatThread, Cursor, Glyph, Line, LineLadder, Lockup, MarqueeWall, NotifCard, Phone, PillButton, SlotCounter, StatusTable, Typewriter, WordSwap, ZoomThrough} from './parts';

export const SAMPLER_FRAMES = sec(33.4);
// The music bed is a local, gitignored file (generated music stays out of the public repo): plays when present.
// The leading _ keeps the commit guard from reading the folder as a company name.
const BED = '_launch-sampler/music_bed.m4a';

const channels = ['💬', '📱', '✉️', '🌐'];

const ChatScreen: React.FC = () => {
  const look = useLook();
  return (
    <>
      <div style={{position: 'absolute', top: 84, left: 0, right: 0, textAlign: 'center', fontFamily: LF.sans, paddingBottom: 18, borderBottom: `1px solid ${look.faint}`}}>
        <div style={{width: 88, height: 88, borderRadius: 99, background: '#C9D6E8', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, fontWeight: 600, color: '#fff'}}>S</div>
        <div style={{fontSize: 26, fontWeight: 600, color: look.ink}}>Sam</div>
      </div>
      <ChatThread
        size={32}
        padTop={270}
        pad={26}
        messages={[
          {from: 'them', text: 'Hi! Can I move our table to Friday?', at: 250},
          {from: 'me', text: 'Of course. Friday at 7 is booked for four.', at: 300, typing: 26},
          {from: 'them', text: 'Amazing, thank you 🙏', at: 345},
        ]}
      />
    </>
  );
};

const wallTop = [
  <NotifCard key={1} app="Example" title="Replied to Priya" body="Your order ships tomorrow morning." tint="#2F7BFF" />,
  <Bubble key={2} text="Is the patio open tonight?" />,
  <NotifCard key={3} app="Example" title="Booked: Tue 6:30" body="Table for two, window seat." tint="#20B15A" />,
  <Bubble key={4} text="Done, see you at 8!" me />,
  <NotifCard key={5} app="Example" title="Replied to Leo" body="Yes, we have it in a size 10." tint="#2F7BFF" />,
  <Bubble key={6} text="Do you deliver on Sundays?" />,
];
const wallMid = [
  <Bubble key={1} text="Thanks, that was fast 🙌" />,
  <Bubble key={2} text="Moved to 3 PM for you." me />,
  <Bubble key={3} text="Can I bring my dog? 🐶" />,
  <Bubble key={4} text="Gift card sent to Ana." me />,
  <Bubble key={5} text="What time do you close?" />,
  <Bubble key={6} text="We close at 10 tonight." me />,
];

export const LaunchSampler: React.FC<{look?: keyof typeof LOOKS}> = ({look = 'keynote'}) => {
  return (
    <Stage look={LOOKS[look]}>
      {getStaticFiles().some((f) => f.name === BED) && <Audio src={staticFile(BED)} />}
        {/* 1. Promise: a giant typed line the camera follows */}
        <Beat from={0} to={100}>
          <Typewriter text="Meet the inbox that writes back." at={0} cps={18} size={210} top={400} pan fitAt={64} />
        </Beat>

        {/* 2. What it does, with a cycling icon slot */}
        <Beat from={100} to={222}>
          <Line text="Every {app} message," at={104} per={4} size={112} top={360} icons={{app: channels}} cycleEvery={12} />
          <Line text="answered in {bolt} *seconds.*" at={124} per={4} size={112} top={500} icons={{bolt: '⚡️'}} />
        </Beat>

        {/* 3. One real task on the product */}
        <Beat from={222} to={400}>
          <Line text="It answers" at={226} size={104} top={380} align="left" x={190} />
          <Line text="*like you would.*" at={240} size={104} top={500} align="left" x={190} />
          <Phone x={1380} y={70} w={620} at={226}>
            <ChatScreen />
          </Phone>
        </Beat>

        {/* 4. Features as a line ladder */}
        <Beat from={400} to={532}>
          <LineLadder top={470} size={112} lines={[{text: 'It knows your calendar.', at: 404}, {text: 'It knows your prices.', at: 446}, {text: 'It knows your *tone.*', at: 488}]} />
        </Beat>

        {/* 5. Proof: a number over a wall of real work, then rush into the next beat */}
        <Beat from={532} to={682}>
          <ZoomThrough at={664} origin="50% 44%">
            <MarqueeWall at={532} tops={[64, 180, 806, 878]} rows={[wallTop, wallMid, wallMid.slice().reverse(), wallTop.slice().reverse()]} />
            <SlotCounter value="12,480" at={548} size={210} top={356} label="replies sent in week one" />
          </ZoomThrough>
        </Beat>

        {/* 6. When it stops and asks */}
        <Beat from={682} to={812}>
          <Line text="And it knows when to *ask you.*" at={686} size={84} top={130} />
          <StatusTable
            top={270}
            w={1240}
            rowH={96}
            rows={[
              {label: 'Table for four, Friday', value: 'Replied', tone: 'ok', at: 694},
              {label: 'Gift card balance', value: 'Replied', tone: 'ok', at: 699},
              {label: 'Refund for a cancelled event', value: 'Replied', at: 704, warnAt: 718, pill: {text: 'Waiting for you', at: 724, tone: 'warn', resolve: {text: 'Sent', at: 782}}},
              {label: 'Sunday opening hours', value: 'Replied', tone: 'ok', at: 709},
            ]}
          />
          <PillButton label="Approve refund" doneLabel="Approved" x={960} y={704} w={320} at={744} pressAt={776} />
          <Cursor path={[{x: 1560, y: 1010, at: 744}, {x: 1076, y: 752, at: 772}]} clicks={[776]} />
        </Beat>

        {/* 7. Who it is for */}
        <Beat from={812} to={904}>
          <WordSwap prefix="Built for" at={816} top={380} size={116} items={[{text: 'front desks.', at: 826}, {text: 'small shops.', at: 852}, {text: 'busy founders.', at: 878}]} />
        </Beat>

        {/* 8. The offer: lockup + where to get it */}
        <Beat from={904} to={SAMPLER_FRAMES + 30}>
          <Lockup pre="The all-new" name="Example" url="example.com" at={904} size={104} top={410} icon={<AppIcon size={124}><div style={{width: 64, height: 64}}>{Glyph.chat()}</div></AppIcon>} />
        </Beat>
    </Stage>
  );
};
