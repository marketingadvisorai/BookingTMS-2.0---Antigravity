import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Switch } from '../../ui/switch';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Trash2, Plus } from 'lucide-react';
import { StepProps } from '../types';
import { LANGUAGES, EXISTING_FAQS, EXISTING_POLICIES } from '../constants';

export default function Step3ActivityDetails({ activityData, updateActivityData, t }: StepProps) {
    const toggleLanguage = (lang: string) => {
        const currentLangs = activityData.language;
        if (currentLangs.includes(lang)) {
            updateActivityData(
                'language',
                currentLangs.filter((l) => l !== lang)
            );
        } else {
            updateActivityData('language', [...currentLangs, lang]);
        }
    };

    const addFaq = () => {
        const newFaqs = [...activityData.faqs, { id: Date.now().toString(), question: '', answer: '' }];
        updateActivityData('faqs', newFaqs);
    };

    const removeFaq = (index: number) => {
        const newFaqs = activityData.faqs.filter((_, i) => i !== index);
        updateActivityData('faqs', newFaqs);
    };

    const updateFaq = (index: number, field: string, value: string) => {
        const newFaqs = [...activityData.faqs];
        newFaqs[index] = { ...newFaqs[index], [field]: value };
        updateActivityData('faqs', newFaqs);
    };

    const addPolicy = () => {
        const newPolicies = [
            ...activityData.cancellationPolicies,
            { id: Date.now().toString(), title: '', description: '' },
        ];
        updateActivityData('cancellationPolicies', newPolicies);
    };

    const removePolicy = (index: number) => {
        const newPolicies = activityData.cancellationPolicies.filter((_, i) => i !== index);
        updateActivityData('cancellationPolicies', newPolicies);
    };

    const updatePolicy = (index: number, field: string, value: string) => {
        const newPolicies = [...activityData.cancellationPolicies];
        newPolicies[index] = { ...newPolicies[index], [field]: value };
        updateActivityData('cancellationPolicies', newPolicies);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t.singular} Details</CardTitle>
                    <CardDescription>
                        Specifics about the experience, location, and policies
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Duration & Difficulty */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="duration">Duration (minutes)</Label>
                            <Input
                                id="duration"
                                type="number"
                                min="1"
                                value={activityData.duration}
                                onChange={(e) => updateActivityData('duration', parseInt(e.target.value))}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="difficulty">Difficulty (1-5)</Label>
                            <Select
                                value={activityData.difficulty.toString()}
                                onValueChange={(value) => updateActivityData('difficulty', parseInt(value))}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1 - Very Easy</SelectItem>
                                    <SelectItem value="2">2 - Easy</SelectItem>
                                    <SelectItem value="3">3 - Moderate</SelectItem>
                                    <SelectItem value="4">4 - Hard</SelectItem>
                                    <SelectItem value="5">5 - Very Hard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Age & Success Rate */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="minAge">Minimum Age</Label>
                            <Input
                                id="minAge"
                                type="number"
                                min="0"
                                value={activityData.minAge}
                                onChange={(e) => updateActivityData('minAge', parseInt(e.target.value))}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="successRate">Success Rate (%)</Label>
                            <Input
                                id="successRate"
                                type="number"
                                min="0"
                                max="100"
                                value={activityData.successRate}
                                onChange={(e) => updateActivityData('successRate', parseInt(e.target.value))}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    {/* Languages */}
                    <div>
                        <Label className="mb-2 block">Available Languages</Label>
                        <div className="flex flex-wrap gap-2">
                            {LANGUAGES.map((lang) => (
                                <Badge
                                    key={lang}
                                    variant={activityData.language.includes(lang) ? 'default' : 'outline'}
                                    className="cursor-pointer"
                                    onClick={() => toggleLanguage(lang)}
                                >
                                    {lang}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <Label htmlFor="location">Location / Room</Label>
                        <Input
                            id="location"
                            placeholder="e.g., Room 101, Main Hall, or Online Link"
                            value={activityData.location}
                            onChange={(e) => updateActivityData('location', e.target.value)}
                            className="mt-1"
                        />
                    </div>

                    {/* Accessibility */}
                    <div className="space-y-3">
                        <Label>Accessibility</Label>
                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <Label htmlFor="wheelchair" className="cursor-pointer">
                                Wheelchair Accessible
                            </Label>
                            <Switch
                                id="wheelchair"
                                checked={activityData.accessibility.wheelchairAccessible}
                                onCheckedChange={(checked) =>
                                    updateActivityData('accessibility', {
                                        ...activityData.accessibility,
                                        wheelchairAccessible: checked,
                                    })
                                }
                            />
                        </div>
                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <Label htmlFor="stroller" className="cursor-pointer">
                                Stroller Accessible
                            </Label>
                            <Switch
                                id="stroller"
                                checked={activityData.accessibility.strollerAccessible}
                                onCheckedChange={(checked) =>
                                    updateActivityData('accessibility', {
                                        ...activityData.accessibility,
                                        strollerAccessible: checked,
                                    })
                                }
                            />
                        </div>
                    </div>

                    {/* FAQs */}
                    <div className="space-y-4 border-t pt-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-base">FAQs</Label>
                            <div className="flex gap-2">
                                <Select onValueChange={(value) => {
                                    const faq = EXISTING_FAQS.find(f => f.id === value);
                                    if (faq) {
                                        updateActivityData('faqs', [...activityData.faqs, { ...faq, id: Date.now().toString() }]);
                                    }
                                }}>
                                    <SelectTrigger className="w-[180px] h-8 text-xs">
                                        <SelectValue placeholder="Import Existing FAQ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {EXISTING_FAQS.map(faq => (
                                            <SelectItem key={faq.id} value={faq.id}>{faq.question}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button variant="outline" size="sm" onClick={addFaq}>
                                    <Plus className="w-4 h-4 mr-2" /> Add Custom
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {activityData.faqs.map((faq, index) => (
                                <div key={faq.id} className="space-y-2 bg-gray-50 p-3 rounded-lg relative group">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeFaq(index)}
                                        className="absolute top-2 right-2 h-6 w-6 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                    <Input
                                        placeholder="Question"
                                        value={faq.question}
                                        onChange={(e) => updateFaq(index, 'question', e.target.value)}
                                        className="font-medium border-transparent bg-transparent focus:bg-white focus:border-input px-0"
                                    />
                                    <Textarea
                                        placeholder="Answer"
                                        value={faq.answer}
                                        onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                                        className="text-sm text-gray-600 border-transparent bg-transparent focus:bg-white focus:border-input px-0 min-h-[60px]"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Policies */}
                    <div className="space-y-4 border-t pt-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-base">Policies</Label>
                            <div className="flex gap-2">
                                <Select onValueChange={(value) => {
                                    const policy = EXISTING_POLICIES.find(p => p.id === value);
                                    if (policy) {
                                        updateActivityData('cancellationPolicies', [...activityData.cancellationPolicies, { ...policy, id: Date.now().toString() }]);
                                    }
                                }}>
                                    <SelectTrigger className="w-[180px] h-8 text-xs">
                                        <SelectValue placeholder="Import Policy" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {EXISTING_POLICIES.map(policy => (
                                            <SelectItem key={policy.id} value={policy.id}>{policy.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button variant="outline" size="sm" onClick={addPolicy}>
                                    <Plus className="w-4 h-4 mr-2" /> Add Custom
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {activityData.cancellationPolicies.map((policy, index) => (
                                <div key={policy.id} className="space-y-2 bg-gray-50 p-3 rounded-lg relative group">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removePolicy(index)}
                                        className="absolute top-2 right-2 h-6 w-6 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                    <Input
                                        placeholder="Policy Title"
                                        value={policy.title}
                                        onChange={(e) => updatePolicy(index, 'title', e.target.value)}
                                        className="font-medium border-transparent bg-transparent focus:bg-white focus:border-input px-0"
                                    />
                                    <Textarea
                                        placeholder="Policy Description"
                                        value={policy.description}
                                        onChange={(e) => updatePolicy(index, 'description', e.target.value)}
                                        className="text-sm text-gray-600 border-transparent bg-transparent focus:bg-white focus:border-input px-0 min-h-[60px]"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
