import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { SkillService, DepartmentService } from '../../core/services/api.services';
import { Skill, Department } from '../../core/models';

@Component({ selector: 'app-skills', templateUrl: './skills.component.html' })
export class SkillsComponent implements OnInit {
  skills: Skill[] = [];
  filtered: Skill[] = [];
  departments: Department[] = [];
  loading = true;
  showForm = false;
  showDelConfirm = false;
  formMode: 'create' | 'edit' = 'create';
  selected: Skill | null = null;
  saving = false;
  searchTerm = '';
  filterCategory = '';
  form: any = { name: '', category: '' };

  categories: string[] = [];

  constructor(public auth: AuthService, private skillService: SkillService, private deptService: DepartmentService) {}

  ngOnInit(): void {
    this.load();
    this.deptService.getAll().subscribe(r => { if (r.success) this.departments = r.data; });
  }

  load(): void {
    this.loading = true;
    this.skillService.getAll().subscribe(r => {
      if (r.success) {
        this.skills = r.data;
        this.categories = [...new Set(r.data.map(s => s.category || 'General').filter(Boolean))].sort();
        this.applyFilters();
      }
      this.loading = false;
    });
  }

  applyFilters(): void {
    this.filtered = this.skills.filter(s => {
      const matchSearch = !this.searchTerm || s.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchCat = !this.filterCategory || s.category === this.filterCategory;
      return matchSearch && matchCat;
    });
  }

  get groupedSkills(): { category: string; skills: Skill[] }[] {
    const groups: Record<string, Skill[]> = {};
    this.filtered.forEach(s => {
      const cat = s.category || 'General';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(s);
    });
    return Object.entries(groups).map(([category, skills]) => ({ category, skills })).sort((a, b) => a.category.localeCompare(b.category));
  }

  openCreate(): void {
    this.formMode = 'create';
    this.form = { name: '', category: this.categories[0] || '' };
    this.showForm = true;
  }

  openEdit(s: Skill): void {
    this.formMode = 'edit';
    this.selected = s;
    this.form = { name: s.name, category: s.category || '' };
    this.showForm = true;
  }

  save(): void {
    if (!this.form.name) return;
    this.saving = true;
    const obs = this.formMode === 'create'
      ? this.skillService.create(this.form)
      : this.skillService.update(this.selected!.id, this.form);
    obs.subscribe(r => {
      this.saving = false;
      if (r.success) { this.showForm = false; this.load(); }
    });
  }

  confirmDelete(s: Skill): void { this.selected = s; this.showDelConfirm = true; }
  doDelete(): void {
    this.skillService.delete(this.selected!.id).subscribe(r => {
      if (r.success) { this.showDelConfirm = false; this.load(); }
    });
  }

  getCategoryColor(cat: string): string {
    const m: Record<string, string> = {
      Backend: 'badge-blue', Frontend: 'badge-purple', Database: 'badge-yellow',
      DevOps: 'badge-green', QA: 'badge-red', Design: 'badge-gray', 'UI/UX': 'badge-gray'
    };
    return m[cat] || 'badge-gray';
  }
}
