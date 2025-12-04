import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
    Clock,
    Users,
    DollarSign,
    MoreVertical,
    Edit,
    Copy,
    Trash2,
    Calendar,
    Power,
    Trophy,
    MapPin,
    Building2
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { Game } from '../types';

interface GameCardProps {
    game: Game & {
        venue_name?: string | null;
        venue_id_display?: string | null;
        organization_name?: string | null;
        organization_id_display?: string | null;
    };
    onEdit: (game: Game) => void;
    onViewBookings: (game: Game) => void;
    onDuplicate: (game: Game) => void;
    onDelete: (game: Game) => void;
    onToggleStatus: (id: string, currentStatus: boolean) => void;
    /** Show extended info for system admins */
    showOrgInfo?: boolean;
    /** Terminology object for dynamic labels */
    terminology?: {
        singular: string;
        plural: string;
    };
}

export function GameCard({
    game,
    onEdit,
    onViewBookings,
    onDuplicate,
    onDelete,
    onToggleStatus,
    showOrgInfo = false,
    terminology = { singular: 'Activity', plural: 'Activities' }
}: GameCardProps) {
    return (
        <Card className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow duration-200" data-testid={`game-card-${game.name}`}>
            <div className="relative h-48 bg-gray-100 dark:bg-[#2a2a2a]">
                {game.image_url ? (
                    <img
                        src={game.image_url}
                        alt={game.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Trophy className="w-12 h-12" />
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <Badge
                        variant={game.is_active ? "default" : "secondary"}
                        className={game.is_active ? "bg-green-600 hover:bg-green-700" : "bg-gray-500 hover:bg-gray-600"}
                    >
                        {game.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                </div>
            </div>

            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg line-clamp-1 text-gray-900 dark:text-white">
                            {game.name}
                        </h3>
                        {/* Organization info (for system admins) */}
                        {showOrgInfo && game.organization_name && (
                            <div className="flex items-center gap-1 mt-0.5 text-xs text-blue-600 dark:text-blue-400">
                                <Building2 className="w-3 h-3" />
                                <span className="truncate">{game.organization_name}</span>
                                {game.organization_id_display && (
                                    <span className="text-gray-400 font-mono">({game.organization_id_display.slice(0, 8)}...)</span>
                                )}
                            </div>
                        )}
                        {/* Venue info */}
                        {game.venue_name && (
                            <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{game.venue_name}</span>
                                {showOrgInfo && game.venue_id_display && (
                                    <span className="text-gray-400 font-mono">({game.venue_id_display.slice(0, 8)}...)</span>
                                )}
                            </div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs font-normal">
                                {game.difficulty}
                            </Badge>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="game-actions-trigger">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onEdit(game)} data-testid="edit-game-action">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit {terminology.singular}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDuplicate(game)}>
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onToggleStatus(game.id, game.is_active)}>
                                <Power className="w-4 h-4 mr-2" />
                                {game.is_active ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/50"
                                onClick={() => onDelete(game)}
                                data-testid={`delete-game-${game.name}`}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete {terminology.singular}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-2 flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 min-h-[2.5rem]">
                    {game.description || 'No description provided.'}
                </p>

                <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        {game.duration_minutes} mins
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <Users className="w-4 h-4 mr-2 text-gray-400" />
                        {game.min_players}-{game.max_players} players
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300 col-span-2">
                        <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                        ${game.price} / person
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => onEdit(game)}
                >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit {terminology.singular}
                </Button>
            </CardFooter>
        </Card>
    );
}
