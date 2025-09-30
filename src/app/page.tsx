import HeroSection from '@/components/home/hero-section';
import UpdatesSection from '@/components/home/updates-section';
import MissionSection from '@/components/home/mission-section';
import EventsSection from '@/components/home/events-section';
import ConnectSection from '@/components/home/connect-section';

export default function Home() {
  return (
    <>
      <HeroSection />
      <UpdatesSection />
      <MissionSection />
      <EventsSection />
      <ConnectSection />
    </>
  );
}
