
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompanyList from "@/components/CompanyList";
import StudentList from "@/components/StudentList";
import InterviewSchedule from "@/components/InterviewSchedule";
import { useInternshipSystem } from "@/hooks/useInternshipSystem";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { autoAssignInterviews } = useInternshipSystem();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Internship Matching System</h1>
          <p className="text-muted-foreground">
            Manage companies, student preferences, and interview schedules
          </p>
        </div>

        <div className="flex justify-end">
          <Button onClick={autoAssignInterviews}>
            Auto-Assign Interviews
          </Button>
        </div>

        <Tabs defaultValue="companies" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="schedule">Interview Schedule</TabsTrigger>
          </TabsList>
          <TabsContent value="companies">
            <CompanyList />
          </TabsContent>
          <TabsContent value="students">
            <StudentList />
          </TabsContent>
          <TabsContent value="schedule">
            <InterviewSchedule />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
