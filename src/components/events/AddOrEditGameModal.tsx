
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Activity, ActivityInput } from '../../services/DataSyncService';
import { toast } from 'sonner';

interface AddOrEditActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activityData: ActivityInput) => void;
  activityToEdit?: Activity | null;
}

const AddOrEditActivityModal = ({ isOpen, onClose, onSave, activityToEdit }: AddOrEditActivityModalProps) => {
  const [activityData, setActivityData] = useState<Partial<ActivityInput>>({});
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (activityToEdit) {
      setActivityData(activityToEdit);
    } else {
      setActivityData({});
    }
  }, [activityToEdit]);

  const handleInputChange = (field: keyof ActivityInput, value: any) => {
    setActivityData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!activityData.name) {
      toast.error('Activity Name is required.');
      return;
    }
    onSave(activityData as ActivityInput);
  };

  const steps = [
    {
      title: 'Basic Info',
      fields: (
        <>
          <div className="space-y-2">
            <Label htmlFor="name">Activity Name</Label>
            <Input id="name" value={activityData.name || ''} onChange={e => handleInputChange('name', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input id="tagline" value={activityData.tagline || ''} onChange={e => handleInputChange('tagline', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="basePrice">Price ($)</Label>
              <Input id="basePrice" type="number" value={activityData.basePrice || ''} onChange={e => handleInputChange('basePrice', parseFloat(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input id="duration" value={activityData.duration || ''} onChange={e => handleInputChange('duration', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ageRange">Age Range</Label>
              <Input id="ageRange" value={activityData.ageRange || ''} onChange={e => handleInputChange('ageRange', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input id="capacity" type="number" value={activityData.capacity || ''} onChange={e => handleInputChange('capacity', parseInt(e.target.value, 10))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level (1-5)</Label>
            <Input id="difficulty" type="number" value={activityData.difficulty || ''} onChange={e => handleInputChange('difficulty', parseInt(e.target.value, 10))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={activityData.description || ''} onChange={e => handleInputChange('description', e.target.value)} />
          </div>
        </>
      )
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[80vw] h-[90vh]">
        <DialogHeader>
          <DialogTitle>{activityToEdit ? 'Edit Activity' : 'Add New Activity'}</DialogTitle>
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

export default AddOrEditActivityModal;
