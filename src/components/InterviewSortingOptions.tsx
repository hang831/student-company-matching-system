
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface InterviewSortingOptionsProps {
  sortMode: string;
  onSortChange: (mode: string) => void;
}

const InterviewSortingOptions = ({ sortMode, onSortChange }: InterviewSortingOptionsProps) => {
  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-md">
      <h3 className="text-sm font-medium mb-2">Sort interviews by:</h3>
      <RadioGroup 
        value={sortMode} 
        onValueChange={onSortChange}
        className="flex flex-row space-x-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="date" id="date" />
          <Label htmlFor="date">Date</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="company" id="company" />
          <Label htmlFor="company">Company</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default InterviewSortingOptions;
