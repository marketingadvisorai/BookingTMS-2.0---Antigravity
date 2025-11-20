
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Game, GameInput } from '../../services/DataSyncService';
import { toast } from 'sonner';

interface AddOrEditGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (gameData: GameInput) => void;
  gameToEdit?: Game | null;
}

const AddOrEditGameModal = ({ isOpen, onClose, onSave, gameToEdit }: AddOrEditGameModalProps) => {
  const [gameData, setGameData] = useState<Partial<GameInput>>({});
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (gameToEdit) {
      setGameData(gameToEdit);
    } else {
      setGameData({});
    }
  }, [gameToEdit]);

  const handleInputChange = (field: keyof GameInput, value: any) => {
    setGameData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!gameData.name) {
      toast.error('Game Name is required.');
      return;
    }
    onSave(gameData as GameInput);
  };

  const steps = [
    {
      title: 'Basic Info',
      fields: (
        <>
          <div className="space-y-2">
            <Label htmlFor="name">Experience Name</Label>
            <Input id="name" value={gameData.name || ''} onChange={e => handleInputChange('name', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input id="tagline" value={gameData.tagline || ''} onChange={e => handleInputChange('tagline', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="basePrice">Price ($)</Label>
              <Input id="basePrice" type="number" value={gameData.basePrice || ''} onChange={e => handleInputChange('basePrice', parseFloat(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input id="duration" value={gameData.duration || ''} onChange={e => handleInputChange('duration', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ageRange">Age Range</Label>
              <Input id="ageRange" value={gameData.ageRange || ''} onChange={e => handleInputChange('ageRange', e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="capacity">Players</Label>
                <Input id="capacity" type="number" value={gameData.capacity || ''} onChange={e => handleInputChange('capacity', parseInt(e.target.value, 10))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level (1-5)</Label>
            <Input id="difficulty" type="number" value={gameData.difficulty || ''} onChange={e => handleInputChange('difficulty', parseInt(e.target.value, 10))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={gameData.description || ''} onChange={e => handleInputChange('description', e.target.value)} />
          </div>
        </>
      )
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[80vw] h-[90vh]">
        <DialogHeader>
          <DialogTitle>{gameToEdit ? 'Edit Experience' : 'Add New Experience'}</DialogTitle>
          <DialogDescription>Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">{steps[currentStep].fields}</div>
        <DialogFooter>
          {currentStep > 0 && <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>Previous</Button>}
          {currentStep < steps.length - 1 && <Button onClick={() => setCurrentStep(currentStep + 1)}>Next</Button>}
          {currentStep === steps.length - 1 && <Button onClick={handleSave}>Save</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddOrEditGameModal;
