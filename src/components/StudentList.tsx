
import { useState } from "react";
import { useInternshipSystem } from "@/hooks/useInternshipSystem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Star, IdCard, Phone, BookOpen } from "lucide-react";
import { Student } from "@/types";

const StudentList = () => {
  const { students, companies, addStudentPreference, updateStudent } = useInternshipSystem();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedStudent, setEditedStudent] = useState<Student | null>(null);
  
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

  const handleEdit = (student: Student) => {
    setEditedStudent({...student});
    setEditMode(true);
  };

  const handleSaveEdit = () => {
    if (editedStudent) {
      updateStudent(editedStudent);
      setEditMode(false);
      setEditedStudent(null);
    }
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
              <div className="space-y-2 mb-4">
                <p className="text-sm text-muted-foreground flex items-center">
                  <IdCard className="h-4 w-4 mr-2" />
                  ID: {student.studentId}
                </p>
                <p className="text-sm text-muted-foreground flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Tel: {student.tel}
                </p>
                <p className="text-sm text-muted-foreground flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  GPA: {student.gpa}
                </p>
              </div>
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
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(student);
                }}
              >
                Edit Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedStudent && (
        <Dialog open={!!selectedStudent && !editMode} onOpenChange={(open) => !open && setSelectedStudent(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Student Preferences</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <h3 className="text-lg font-medium mb-2">{selectedStudent.name}</h3>
              <div className="space-y-1 mb-4">
                <p className="text-sm text-muted-foreground flex items-center">
                  <IdCard className="h-4 w-4 mr-2" />
                  ID: {selectedStudent.studentId}
                </p>
                <p className="text-sm text-muted-foreground flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Tel: {selectedStudent.tel}
                </p>
                <p className="text-sm text-muted-foreground flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  GPA: {selectedStudent.gpa}
                </p>
              </div>
              
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

      {editMode && editedStudent && (
        <Dialog open={editMode} onOpenChange={(open) => !open && setEditMode(false)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editedStudent.name}
                  onChange={(e) => setEditedStudent({...editedStudent, name: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={editedStudent.email}
                  onChange={(e) => setEditedStudent({...editedStudent, email: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  value={editedStudent.studentId}
                  onChange={(e) => setEditedStudent({...editedStudent, studentId: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tel">Telephone</Label>
                <Input
                  id="tel"
                  value={editedStudent.tel}
                  onChange={(e) => setEditedStudent({...editedStudent, tel: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gpa">GPA</Label>
                <Input
                  id="gpa"
                  value={editedStudent.gpa}
                  onChange={(e) => setEditedStudent({...editedStudent, gpa: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default StudentList;
