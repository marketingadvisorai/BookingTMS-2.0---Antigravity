/**
 * BookingHero - Hero section for the booking page
 * Displays game image, name, rating, and quick info
 */
import React from 'react';
import { Star, Clock, Users, MapPin, Play, Info, Sparkles } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import { BookingHeroProps } from './types';

export function BookingHero({ gameData, primaryColor, onShowDetails, onShowVideo }: BookingHeroProps) {
  const heroImage = gameData.image;
  const hasVideo = gameData.gallery?.some((url: string) => url.includes('video')) || false;

  return (
    <div className="relative h-[280px] sm:h-[320px] bg-black overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src={heroImage}
          alt={`${gameData.name} escape room experience`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />

      {/* Top Actions */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        {hasVideo && (
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border-0"
            onClick={onShowVideo}
          >
            <Play className="w-4 h-4 mr-1" />
            Watch Video
          </Button>
        )}
        <Button
          variant="secondary"
          size="sm"
          className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border-0"
          onClick={onShowDetails}
        >
          <Info className="w-4 h-4 mr-1" />
          Details
        </Button>
      </div>

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge className="text-white border-white/30" style={{ backgroundColor: `${primaryColor}CC` }}>
              <Sparkles className="w-3 h-3 mr-1" />
              Most Popular
            </Badge>
            <Badge variant="outline" className="bg-white/10 text-white border-white/30 backdrop-blur-sm">
              <Clock className="w-3 h-3 mr-1" />
              {typeof gameData.duration === 'number' ? `${gameData.duration} min` : gameData.duration}
            </Badge>
            <Badge variant="outline" className="bg-white/10 text-white border-white/30 backdrop-blur-sm">
              <Users className="w-3 h-3 mr-1" />
              {gameData.players}
            </Badge>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 drop-shadow-lg">
            {gameData.name}
          </h1>

          {/* Rating and Location */}
          <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{gameData.rating}</span>
              <span className="text-white/70">({gameData.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center gap-1 text-white/70">
              <MapPin className="w-4 h-4" />
              <span>{gameData.location}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingHero;
