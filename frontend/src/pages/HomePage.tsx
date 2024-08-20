import React, { useState } from 'react';
import Layout from '../components/Layout/Layout';
import Card from '../components/Home/HomeCard';
import CardDetails from '../components/Home/CardDetails';

const HomePage: React.FC = () => {

  const [selectedCard, setSelectedCard] = useState<{
    id: number;
    title: string;
    content: string;
    iconType: 'Delivery' | 'Dining' | 'Takeaway';
  } | null>(null);

  const cards = [
    { id: 1, title: 'Delivery Orders', content: 'Details of Delivery Orders', iconType: 'Delivery' as 'Delivery' },
    { id: 2, title: 'Dining Orders', content: 'Details of Dining Orders', iconType: 'Dining' as 'Dining' },
    { id: 3, title: 'Takeaway Orders', content: 'Details of Takeaway Orders', iconType: 'Takeaway' as 'Takeaway' },
  ];

  return (
    <Layout>
      <div className="grid grid-cols-12 gap-4 p-4 bg-[#8D4CF957] h-full">
        <div className="col-span-2 space-y-12 flex flex-col items-center ">
          {cards.map((card) => (
          <div className='hover:bg-black '>
            <Card key={card.id} card={card} onClick={() => setSelectedCard(card)} />
            </div>
          ))}
        </div>
        <div className="col-span-10">
          <CardDetails selectedCard={selectedCard} />
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
