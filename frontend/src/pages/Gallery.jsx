import React, { useState } from 'react';
import Masonry from 'react-masonry-css';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const items = [
     "https://www.flamingotravels.co.in/blog/wp-content/uploads/2020/06/Amer-Fort.jpg",
    "https://www.flamingotravels.co.in/blog/wp-content/uploads/2020/06/Mehrangarh-Fort.jpg",
    "https://www.flamingotravels.co.in/blog/wp-content/uploads/2020/06/Chittorgarh-Fort.jpg",
    "https://www.flamingotravels.co.in/blog/wp-content/uploads/2020/06/feture_image3.jpg",
    "https://i.pinimg.com/736x/d5/1b/75/d51b758696a2031263c7ebe21abb2fdc.jpg",
    "https://i.pinimg.com/736x/d2/c4/c3/d2c4c378a9d7e8d7fcc8985d9f54c8cf.jpg",
    "https://i.pinimg.com/736x/1a/38/e3/1a38e361da899aa0776a5ceea3af17f1.jpg",
    "https://i.pinimg.com/736x/7f/83/21/7f8321c735511d0a5a250cdd2529e6a8.jpg",
    "https://lp-cms-production.imgix.net/2024-07/shutterstockRF248021569.jpg?auto=format,compress&q=72&w=1440&h=810&fit=crop",
    "https://lp-cms-production.imgix.net/2024-07/LPI-27561-13.jpg?auto=format,compress&q=72&fit=crop&w=1200",
    "https://lp-cms-production.imgix.net/2024-07/GettyRF469852152.jpg?auto=format,compress&q=72&fit=crop&w=1200",
    "https://s7ap1.scene7.com/is/image/incredibleindia/calangute-beach-goa-7-musthead-hero?qlt=82&ts=1726735078814",
    "https://i.pinimg.com/736x/b9/a9/f5/b9a9f5037677a0ae51d6ffe9a7150945.jpg",
    "https://i.pinimg.com/736x/10/20/c5/1020c5822afbe84a47141255e9204acd.jpg",
    "https://i.pinimg.com/736x/9a/e7/e1/9ae7e14bc932239dbebb83de85dc989b.jpg",
    "https://i.pinimg.com/736x/09/ea/6c/09ea6cd795435770d90aadc7dbcd58c7.jpg",
    "https://i.pinimg.com/736x/07/1d/3b/071d3b4a5ebb658209e103bcb56a4fae.jpg",
    "https://i.pinimg.com/736x/75/07/2e/75072e0c33886071b2451cd7cf0a21fd.jpg",
    "https://i.pinimg.com/736x/11/a2/c3/11a2c3d7a387f65aef559bd722553db5.jpg",
    "https://i.pinimg.com/736x/58/99/c4/5899c4db843faa15724f0b698b037848.jpg",
    "https://i.pinimg.com/736x/5c/f2/7b/5cf27b93f2c28910481ef045a93fc0d6.jpg",
    "https://i.pinimg.com/736x/10/41/d5/1041d540e8d07a9a56d604b91c7e836d.jpg",
    "https://i.pinimg.com/736x/d3/db/f6/d3dbf6cf8104cc0ca9c53b3b66f0ef77.jpg",
    "https://i.pinimg.com/736x/81/95/56/819556f38acc911ac1c86c7c34e6730c.jpg",
    "https://i.pinimg.com/736x/02/c6/ff/02c6fff00d27c46faa13dad2fd9120cc.jpg",
    "https://i.pinimg.com/736x/27/73/7a/27737aeb2d1dad101c1e717dedbe0715.jpg",
    "https://i.pinimg.com/736x/d3/37/b8/d337b80d49867492eebf6cccc73fc6ef.jpg",
    "https://i.pinimg.com/736x/6a/87/34/6a8734c81cd0fa8621714fe9eb1e745c.jpg",
    "https://i.pinimg.com/736x/39/97/11/3997115dcbfad7f647dc475deb88c22a.jpg",
    "https://i.pinimg.com/736x/73/b4/d8/73b4d89ff923544f25be3ee8a98928b3.jpg",
    "https://i.pinimg.com/736x/69/92/ec/6992ec3b0acd25a6fb660ef49bcefc4b.jpg",
    "https://i.pinimg.com/736x/7f/a1/65/7fa1650e53f107a8cdd7aedcff061be2.jpg",
    "https://i.pinimg.com/736x/73/03/2a/73032a2e6e3d1535d9cf76c62acacd9f.jpg",
    "https://i.pinimg.com/736x/2c/d8/6e/2cd86ed2657bd73c4755a103c97c9f07.jpg",
    "https://i.pinimg.com/736x/1f/8f/8e/1f8f8e7bb8e52ce4ed68c74bfd0dd3d4.jpg",
    "https://i.pinimg.com/736x/ce/cc/18/cecc1829842cfb7576cf21546ccd5b51.jpg",
    "https://i.pinimg.com/736x/5e/62/03/5e6203626dbee9a8c171327855d86362.jpg",
    "https://i.pinimg.com/736x/8a/e9/99/8ae999537dfdc473c8af9a9c2a2b6859.jpg",
    "https://i.pinimg.com/736x/e6/1e/4f/e61e4fc45405c0ad7b8c0081ab3d6d7a.jpg",
    "https://i.pinimg.com/736x/56/8a/8c/568a8c27d79dde09c540f9149e481f86.jpg",
    "https://i.pinimg.com/736x/ab/06/7c/ab067c4a9f21209ed1c45f7d13fd9833.jpg",
    "https://i.pinimg.com/736x/06/4c/d1/064cd1d934f91222d37625111e27e7e6.jpg",
    "https://i.pinimg.com/736x/ba/2d/0b/ba2d0ba9080d10fad5dfcb098731617b.jpg",
    "https://i.pinimg.com/736x/da/d2/65/dad26591b114f447953584361c2ca24e.jpg",
    "https://i.pinimg.com/736x/47/5e/cd/475ecd27fd20a84ce5f3b26c9a92ad20.jpg",
    "https://i.pinimg.com/736x/df/a1/67/dfa167f8151135646222bcddd0bb468b.jpg",
    "https://i.pinimg.com/736x/87/ec/40/87ec4001d65ff008e04a1e259a80f4f9.jpg",
    "https://i.pinimg.com/736x/81/b9/21/81b921fab3c3bbdba73c56bcd41eca41.jpg",
    "https://i.pinimg.com/736x/b9/3f/9f/b93f9f90c018b57c62f72e946dfcdd56.jpg",
    "https://i.pinimg.com/736x/10/19/e5/1019e549e84cf48fa2417e3981c5e009.jpg",
    "https://i.pinimg.com/736x/46/54/59/4654590d41b4bc29649722dcf4b1bbfc.jpg"
];

const Gallery = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openModal = (index) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  const prevImage = () => setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  const nextImage = () => setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));

  const breakpointColumnsObj = {
    default: 5,
    1280: 5,
    1024: 3,
    768: 2,
    640: 1
  };

  return (
    <>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex gap-4"
        columnClassName="flex flex-col gap-4"
      >
        {items.map((src, index) => (
          <div key={index} className="cursor-pointer" onClick={() => openModal(index)}>
            <img src={src} alt={`img-${index}`} className="rounded-lg w-full object-cover hover:opacity-90 transition" />
          </div>
        ))}
      </Masonry>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center px-4">
          <button
            className="absolute top-4 right-4 text-white hover:text-red-400 transition"
            onClick={closeModal}
          >
            <X size={30} />
          </button>

          <button
            className="absolute left-4 md:left-12 text-white hover:text-yellow-300 transition"
            onClick={prevImage}
          >
            <ChevronLeft size={40} />
          </button>

          <img
            src={items[currentIndex]}
            alt="modal-img"
            className="max-h-[90vh] max-w-full rounded-lg shadow-2xl transition-transform duration-300"
          />

          <button
            className="absolute right-4 md:right-12 text-white hover:text-yellow-300 transition"
            onClick={nextImage}
          >
            <ChevronRight size={40} />
          </button>
        </div>
      )}
    </>
  );
};

export default Gallery;
