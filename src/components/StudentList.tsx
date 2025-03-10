
import { useState } from "react";
import { useInternshipSystem } from "@/hooks/useInternshipSystem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Star } from "lucide-react";
import { Student } from "@/types";

const StudentList = () => {
  const { students, companies, addStudentPreference } = useInternshipSystem();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  const handlePreferenceChange = (companyId: string, rank: number) => {
    if (selectedStudent) {
      addStudentPreference({
        studentId: selectedStudent.id,
        companyId,
        rank,
      });
    }
  };

  // Get preference rank for a company (if exists)
  const getPreferenceRank = (studentId: string, companyId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return null;
    
    const preference = student.preferences.find(p => p.companyId === companyId);
    return preference ? preference.rank : null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Students</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((student) => (
          <Card 
            key={student.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedStudent(student)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-medium">{student.name}</CardTitle>
              <User className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {student.email}
              </p>
              <div className="flex flex-wrap gap-2">
                {companies.map((company) => {
                  const rank = getPreferenceRank(student.id, company.id);
                  return rank ? (
                    <div 
                      key={company.id}
                      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                    >
                      {company.name}: {rank} <Star className="h-3 w-3 ml-1 fill-current" />
                    </div>
                  ) : null;
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedStudent && (
        <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Student Preferences</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <h3 className="text-lg font-medium mb-2">{selectedStudent.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{selectedStudent.email}</p>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Preference Rank</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell>{company.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`rank-${company.id}`} className="w-20">
                            Rank:
                          </Label>
                          <Select 
                            value={getPreferenceRank(selectedStudent.id, company.id)?.toString() || ""}
                            onValueChange={(value) => handlePreferenceChange(company.id, parseInt(value))}
                          >
                            <SelectTrigger id={`rank-${company.id}`} className="w-24">
                              <SelectValue placeholder="Rank" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 (Top)</SelectItem>
                              <SelectItem value="2">2</SelectItem>
                              <SelectItem value="3">3</SelectItem>
                              <SelectItem value="4">4</SelectItem>
                              <SelectItem value="5">5</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Button onClick={() => setSelectedStudent(null)}>Close</Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default StudentList;
