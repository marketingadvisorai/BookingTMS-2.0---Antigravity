import React from 'react';
import {
    X, Star, Clock, Users, Target, Award, MapPin, Play, Sparkles, Info,
    Briefcase, CheckCircle2, Shield, Heart, User, Languages, AlertCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../ui/dialog';
import { VisuallyHidden } from '../../../ui/visually-hidden';
import { ScrollArea } from '../../../ui/scroll-area';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import { Separator } from '../../../ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../ui/accordion';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';

interface GameDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    gameData: any;
    primaryColor: string;
}

export const GameDetailsModal: React.FC<GameDetailsModalProps> = ({
    isOpen,
    onClose,
    gameData,
    primaryColor
}) => {
    if (!gameData) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="!w-screen !h-screen !max-w-none !max-h-none sm:!w-[95vw] sm:!h-[95vh] sm:!max-w-[1200px] sm:!max-h-[95vh] !rounded-none sm:!rounded-xl overflow-hidden p-0 bg-gradient-to-b from-white to-gray-50 flex flex-col">
                {/* Close Button - Visible */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-110 border border-gray-200"
                    aria-label="Close dialog"
                >
                    <X className="w-5 h-5 text-gray-600" />
                </button>

                <VisuallyHidden>
                    <DialogHeader>
                        <DialogTitle>{gameData.name}</DialogTitle>
                        <DialogDescription>
                            Complete guide to {gameData.name} escape room - {gameData.difficulty} difficulty, {gameData.duration} duration, suitable for ages {gameData.ageRecommendation}. Book your adventure now!
                        </DialogDescription>
                    </DialogHeader>
                </VisuallyHidden>

                <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full w-full">
                        {/* Hero Cover Section */}
                        <div className="relative w-full h-[400px] sm:h-[500px] overflow-hidden">
                            {/* Background Image with Overlay */}
                            <div className="absolute inset-0">
                                <ImageWithFallback
                                    src={gameData.image}
                                    alt={gameData.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
                            </div>

                            {/* Hero Content */}
                            <div className="relative h-full flex flex-col justify-end p-6 sm:p-10 lg:p-12">
                                {/* Badges */}
                                <div className="flex items-center gap-3 mb-4">
                                    {gameData.featured && (
                                        <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0 px-3 py-1 text-sm">
                                            ⭐ Featured
                                        </Badge>
                                    )}
                                    <Badge className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm px-3 py-1 text-sm">
                                        <Star className="w-3 h-3 fill-white mr-1" />
                                        {gameData.rating} ({gameData.reviewCount} reviews)
                                    </Badge>
                                </div>

                                {/* Title */}
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl text-white mb-3 sm:mb-4">
                                    {gameData.name}
                                </h1>

                                {/* Description */}
                                <p className="text-base sm:text-lg text-gray-200 mb-6 sm:mb-8 max-w-3xl">
                                    {gameData.description}
                                </p>

                                {/* Quick Info Pills */}
                                <div className="flex flex-wrap gap-3 mb-6">
                                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-white" />
                                        <div>
                                            <div className="text-xs text-gray-300">Duration</div>
                                            <div className="text-sm text-white">{gameData.duration}</div>
                                        </div>
                                    </div>

                                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-white" />
                                        <div>
                                            <div className="text-xs text-gray-300">Players</div>
                                            <div className="text-sm text-white">{gameData.players}</div>
                                        </div>
                                    </div>

                                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
                                        <Target className="w-5 h-5 text-white" />
                                        <div>
                                            <div className="text-xs text-gray-300">Difficulty</div>
                                            <div className="text-sm text-white">{gameData.difficulty}</div>
                                        </div>
                                    </div>

                                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
                                        <Award className="w-5 h-5 text-white" />
                                        <div>
                                            <div className="text-xs text-gray-300">Type</div>
                                            <div className="text-sm text-white">{gameData.gameType}</div>
                                        </div>
                                    </div>

                                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-white" />
                                        <div>
                                            <div className="text-xs text-gray-300">Location</div>
                                            <div className="text-sm text-white">Downtown</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        className="bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md transition-all"
                                        variant="outline"
                                    >
                                        <Play className="w-4 h-4 mr-2" />
                                        View Gallery
                                    </Button>
                                    <Button
                                        className="bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md transition-all"
                                        variant="outline"
                                    >
                                        <Play className="w-4 h-4 mr-2" />
                                        Watch Video
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8 sm:space-y-10 p-4 sm:p-6 lg:p-8 pb-20">
                            {/* Hero Gallery */}
                            <section aria-label="Photo gallery">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                    {gameData.gallery.map((image: string, index: number) => (
                                        <div
                                            key={index}
                                            className="group aspect-video rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 relative"
                                        >
                                            <ImageWithFallback
                                                src={image}
                                                alt={`${gameData.name} escape room - View ${index + 1}`}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Overview */}
                            <section aria-labelledby="overview-heading" className="scroll-mt-20">
                                <div className="flex items-center justify-between mb-4 sm:mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
                                            <Sparkles className="w-5 h-5" style={{ color: primaryColor }} />
                                        </div>
                                        <h2 id="overview-heading" className="text-2xl sm:text-3xl text-gray-900">
                                            Overview
                                        </h2>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 sm:p-8 shadow-sm border border-gray-100">
                                    <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
                                        {gameData.longDescription}
                                    </p>
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 sm:p-5 rounded-r-lg">
                                        <div className="flex items-start gap-3">
                                            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm sm:text-base text-gray-700">
                                                <strong className="text-blue-900">At a Glance:</strong> {gameData.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Collapsible Information Sections - SEO & LLM Optimized */}
                            <section aria-labelledby="detailed-info-heading" className="scroll-mt-20">
                                <VisuallyHidden>
                                    <h2 id="detailed-info-heading">Detailed Activity Information</h2>
                                </VisuallyHidden>

                                <Accordion type="single" collapsible defaultValue="activity-details" className="space-y-4">
                                    {/* Activity Details */}
                                    <AccordionItem
                                        value="activity-details"
                                        className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                                        data-seo-section="activity-details"
                                    >
                                        <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 transition-colors [&[data-state=open]]:bg-gray-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100">
                                                    <Briefcase className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <span className="text-lg text-gray-900">Activity Details</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-6 pb-6">
                                            <div className="space-y-6 pt-2">
                                                {/* Duration & Group Size */}
                                                <div className="grid sm:grid-cols-2 gap-6">
                                                    <div itemScope itemType="https://schema.org/Duration">
                                                        <h3 className="text-base text-gray-900 mb-3 flex items-center gap-2">
                                                            <Clock className="w-5 h-5" style={{ color: primaryColor }} />
                                                            Duration
                                                        </h3>
                                                        <p className="text-gray-700" itemProp="duration">
                                                            <strong className="text-xl" style={{ color: primaryColor }}>{gameData.duration}</strong>
                                                        </p>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            Total experience time including briefing and debriefing
                                                        </p>
                                                    </div>

                                                    <div itemScope itemType="https://schema.org/QuantitativeValue">
                                                        <h3 className="text-base text-gray-900 mb-3 flex items-center gap-2">
                                                            <Users className="w-5 h-5" style={{ color: primaryColor }} />
                                                            Group Size
                                                        </h3>
                                                        <p className="text-gray-700" itemProp="value">
                                                            <strong className="text-xl" style={{ color: primaryColor }}>{gameData.players}</strong>
                                                        </p>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            Private experience - your group only
                                                        </p>
                                                    </div>
                                                </div>

                                                <Separator />

                                                {/* Difficulty Level */}
                                                <div>
                                                    <h3 className="text-base text-gray-900 mb-3 flex items-center gap-2">
                                                        <Target className="w-5 h-5" style={{ color: primaryColor }} />
                                                        Difficulty Level
                                                    </h3>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex gap-1">
                                                            {[1, 2, 3, 4, 5].map((level) => (
                                                                <div
                                                                    key={level}
                                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${level <= gameData.difficulty
                                                                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md'
                                                                        : 'bg-gray-200 text-gray-400'
                                                                        }`}
                                                                >
                                                                    <span className="text-xs">{level}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <span className="text-gray-700">
                                                            <strong style={{ color: primaryColor }}>{gameData.difficulty}/5</strong> - {gameData.difficulty <= 2 ? 'Beginner Friendly' : gameData.difficulty <= 3 ? 'Moderate Challenge' : 'Advanced Puzzlers'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-2">
                                                        {gameData.difficulty <= 2
                                                            ? 'Perfect for first-time escape room enthusiasts and families'
                                                            : gameData.difficulty <= 3
                                                                ? 'Suitable for those with some escape room experience'
                                                                : 'Recommended for experienced escape room teams'}
                                                    </p>
                                                </div>

                                                <Separator />

                                                {/* What's Included */}
                                                <div>
                                                    <h3 className="text-base text-gray-900 mb-4 flex items-center gap-2">
                                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                        What's Included
                                                    </h3>
                                                    <ul className="space-y-3">
                                                        {gameData.whatToExpect.map((item: string, index: number) => (
                                                            <li key={index} className="flex items-start gap-3">
                                                                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-600" />
                                                                <span className="text-gray-700">{item}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <Separator />

                                                {/* Meeting Point */}
                                                <div itemScope itemType="https://schema.org/Place">
                                                    <h3 className="text-base text-gray-900 mb-3 flex items-center gap-2">
                                                        <MapPin className="w-5 h-5" style={{ color: primaryColor }} />
                                                        Meeting Point
                                                    </h3>
                                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                                                        <p className="text-gray-700" itemProp="address">
                                                            <strong>123 Adventure Street, Downtown District</strong><br />
                                                            New York, NY 10001
                                                        </p>
                                                        <p className="text-sm text-gray-600 mt-2">
                                                            Please arrive <strong className="text-blue-900">15 minutes before</strong> your scheduled time for check-in and game briefing
                                                        </p>
                                                    </div>
                                                </div>

                                                <Separator />

                                                {/* Languages Offered */}
                                                <div>
                                                    <h3 className="text-base text-gray-900 mb-3 flex items-center gap-2">
                                                        <Languages className="w-5 h-5" style={{ color: primaryColor }} />
                                                        Available Languages
                                                    </h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {['English', 'Spanish', 'French', 'German'].map((lang) => (
                                                            <Badge key={lang} variant="secondary" className="text-sm px-3 py-1">
                                                                {lang}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-2">
                                                        Game master can provide hints and instructions in multiple languages
                                                    </p>
                                                </div>

                                                {/* Age Recommendation */}
                                                <div className="bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 dark:border-amber-600 p-3 sm:p-4 rounded-r-lg">
                                                    <div className="flex items-start gap-2 sm:gap-3">
                                                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 break-words">
                                                                <strong className="text-amber-900 dark:text-amber-200">Age Requirement:</strong> Recommended for ages {gameData.ageRecommendation}. Children under 16 must be accompanied by an adult.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>

                                    {/* Additional Information */}
                                    <AccordionItem
                                        value="additional-info"
                                        className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                                        data-seo-section="additional-information"
                                    >
                                        <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 transition-colors [&[data-state=open]]:bg-gray-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-100">
                                                    <Info className="w-5 h-5 text-purple-600" />
                                                </div>
                                                <span className="text-lg text-gray-900">Additional Information</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-6 pb-6">
                                            <div className="space-y-6 pt-2">
                                                {/* Accessibility */}
                                                <div>
                                                    <h3 className="text-base text-gray-900 mb-4 flex items-center gap-2">
                                                        <Shield className="w-5 h-5 text-blue-600" />
                                                        Accessibility & Accommodations
                                                    </h3>
                                                    <ul className="space-y-2 text-gray-700">
                                                        <li className="flex items-start gap-2">
                                                            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                                                            <span>Wheelchair accessible facility with elevator access</span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                                                            <span>Accessible restroom facilities available</span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                                                            <span>Service animals are welcome</span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                                                            <span>Special accommodations available - contact us in advance</span>
                                                        </li>
                                                    </ul>
                                                </div>

                                                <Separator />

                                                {/* Health & Safety */}
                                                <div>
                                                    <h3 className="text-base text-gray-900 mb-4 flex items-center gap-2">
                                                        <Heart className="w-5 h-5 text-red-500" />
                                                        Health & Safety Protocols
                                                    </h3>
                                                    <ul className="space-y-2 text-gray-700">
                                                        <li className="flex items-start gap-2">
                                                            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                                                            <span>Rooms sanitized and disinfected between each group</span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                                                            <span>Emergency exits clearly marked and accessible at all times</span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                                                            <span>Game master monitoring via live camera feed</span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                                                            <span>First aid certified staff on-site during all operating hours</span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                                                            <span>Climate-controlled environment for your comfort</span>
                                                        </li>
                                                    </ul>
                                                </div>

                                                <Separator />

                                                {/* What to Bring/Wear */}
                                                <div>
                                                    <h3 className="text-base text-gray-900 mb-4 flex items-center gap-2">
                                                        <User className="w-5 h-5" style={{ color: primaryColor }} />
                                                        What to Bring & Wear
                                                    </h3>
                                                    <div className="grid sm:grid-cols-2 gap-4">
                                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                            <h4 className="text-sm text-green-900 mb-2 flex items-center gap-2">
                                                                <CheckCircle2 className="w-4 h-4" />
                                                                Recommended
                                                            </h4>
                                                            <ul className="space-y-1 text-sm text-green-800">
                                                                <li>• Comfortable clothing</li>
                                                                <li>• Closed-toe shoes</li>
                                                                <li>• Reading glasses (if needed)</li>
                                                            </ul>
                                                        </div>
                                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                                            <h4 className="text-sm text-red-900 mb-2 flex items-center gap-2">
                                                                <X className="w-4 h-4" />
                                                                Please Avoid
                                                            </h4>
                                                            <ul className="space-y-1 text-sm text-red-800">
                                                                <li>• High heels</li>
                                                                <li>• Large bags/backpacks</li>
                                                                <li>• Heavy coats (lockers provided)</li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </section>
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
};
