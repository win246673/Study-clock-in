Page({
  data: {
    currentDate: '',
    records: [],
    totalDays: 0,
    continuousDays: 0,
    todayHours: 0,
    
    showModal: false,
    subjects: [],
    durations: [],
    selectedSubject: '',
    selectedColor: '',
    selectedDuration: '',
    content: '',
    
    showSubjectManager: false,
    showDurationManager: false,
    newSubjectName: '',
    newDurationValue: '',
  },

  onLoad() {
    this.initDate();
    this.loadCustomData();
    this.loadRecords();
  },

  onShow() {
    this.loadCustomData();
    this.loadRecords();
  },

  loadCustomData() {
    const defaultSubjects = [
      { name: '语文', color: '#E53935' },
      { name: '数学', color: '#1E88E5' },
      { name: '英语', color: '#43A047' },
      { name: '物理', color: '#FB8C00' },
      { name: '化学', color: '#8E24AA' },
      { name: '生物', color: '#00ACC1' },
      { name: '历史', color: '#5D4037' },
      { name: '地理', color: '#66BB6A' },
      { name: '编程', color: '#7B1FA2' },
      { name: '阅读', color: '#FF7043' },
    ];
    
    const defaultDurations = [
      { label: '0.5小时', value: 0.5 },
      { label: '1小时', value: 1 },
      { label: '1.5小时', value: 1.5 },
      { label: '2小时', value: 2 },
      { label: '2.5小时', value: 2.5 },
      { label: '3小时', value: 3 },
      { label: '3.5小时', value: 3.5 },
      { label: '4小时', value: 4 },
    ];

    try {
      const subjectsStr = wx.getStorageSync('customSubjects') || JSON.stringify(defaultSubjects);
      const durationsStr = wx.getStorageSync('customDurations') || JSON.stringify(defaultDurations);
      
      this.setData({
        subjects: JSON.parse(subjectsStr),
        durations: JSON.parse(durationsStr)
      });
    } catch (err) {
      console.error('加载自定义数据失败:', err);
      this.setData({
        subjects: defaultSubjects,
        durations: defaultDurations
      });
    }
  },

  saveCustomSubjects(subjects) {
    wx.setStorageSync('customSubjects', JSON.stringify(subjects));
    this.setData({ subjects });
  },

  saveCustomDurations(durations) {
    wx.setStorageSync('customDurations', JSON.stringify(durations));
    this.setData({ durations });
  },

  showSubjectManager() {
    this.setData({ showSubjectManager: true, newSubjectName: '' });
  },

  hideSubjectManager() {
    this.setData({ showSubjectManager: false, newSubjectName: '' });
  },

  onSubjectInput(e) {
    this.setData({ newSubjectName: e.detail.value });
  },

  generateColor() {
    const colors = ['#E53935', '#1E88E5', '#43A047', '#FB8C00', '#8E24AA', '#00ACC1', '#5D4037', '#66BB6A', '#7B1FA2', '#FF7043', '#EC407A', '#26C6DA', '#FFA726', '#78909C', '#5C6BC0'];
    return colors[Math.floor(Math.random() * colors.length)];
  },

  addSubject() {
    const { newSubjectName, subjects } = this.data;
    if (!newSubjectName.trim()) {
      wx.showToast({ title: '请输入科目名称', icon: 'none' });
      return;
    }
    
    const exists = subjects.some(s => s.name === newSubjectName.trim());
    if (exists) {
      wx.showToast({ title: '科目已存在', icon: 'none' });
      return;
    }

    const newSubjects = [...subjects, { name: newSubjectName.trim(), color: this.generateColor() }];
    this.saveCustomSubjects(newSubjects);
    this.setData({ newSubjectName: '' });
    wx.showToast({ title: '添加成功', icon: 'success' });
  },

  deleteSubject(e) {
    const { name } = e.currentTarget.dataset;
    const { subjects } = this.data;
    
    if (subjects.length <= 1) {
      wx.showToast({ title: '至少保留一个科目', icon: 'none' });
      return;
    }

    const newSubjects = subjects.filter(s => s.name !== name);
    this.saveCustomSubjects(newSubjects);
    wx.showToast({ title: '删除成功', icon: 'success' });
  },

  showDurationManager() {
    this.setData({ showDurationManager: true, newDurationValue: '' });
  },

  hideDurationManager() {
    this.setData({ showDurationManager: false, newDurationValue: '' });
  },

  onDurationInput(e) {
    this.setData({ newDurationValue: e.detail.value });
  },

  addDuration() {
    const { newDurationValue, durations } = this.data;
    const value = parseFloat(newDurationValue);
    
    if (isNaN(value) || value <= 0) {
      wx.showToast({ title: '请输入有效时长', icon: 'none' });
      return;
    }
    
    const exists = durations.some(d => d.value === value);
    if (exists) {
      wx.showToast({ title: '时长已存在', icon: 'none' });
      return;
    }

    const newDurations = [...durations, { label: `${value}小时`, value }].sort((a, b) => a.value - b.value);
    this.saveCustomDurations(newDurations);
    this.setData({ newDurationValue: '' });
    wx.showToast({ title: '添加成功', icon: 'success' });
  },

  deleteDuration(e) {
    const { value } = e.currentTarget.dataset;
    const { durations } = this.data;
    
    if (durations.length <= 1) {
      wx.showToast({ title: '至少保留一个时长', icon: 'none' });
      return;
    }

    const newDurations = durations.filter(d => d.value !== parseFloat(value));
    this.saveCustomDurations(newDurations);
    wx.showToast({ title: '删除成功', icon: 'success' });
  },

  initDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekDay = weekDays[now.getDay()];
    this.setData({
      currentDate: `${year}年${month}月${day}日 星期${weekDay}`
    });
  },

  loadRecords() {
    try {
      const recordsStr = wx.getStorageSync('studyRecords') || '[]';
      const records = JSON.parse(recordsStr);
      
      const formattedRecords = records.map(item => {
        const date = new Date(item.createTime);
        return {
          ...item,
          month: date.getMonth() + 1,
          day: date.getDate(),
          time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
        };
      }).sort((a, b) => new Date(b.createTime) - new Date(a.createTime));

      this.setData({ records: formattedRecords });
      this.calculateStats(formattedRecords);
    } catch (err) {
      console.error('加载记录失败:', err);
    }
  },

  calculateStats(records) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayRecords = records.filter(r => {
      const recordDate = new Date(r.createTime);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === today.getTime();
    });

    const todayHours = todayRecords.reduce((sum, r) => sum + parseFloat(r.duration), 0);

    const uniqueDays = new Set();
    records.forEach(r => {
      const date = new Date(r.createTime);
      uniqueDays.add(`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`);
    });

    let continuousDays = 0;
    const sortedDates = Array.from(uniqueDays).sort().reverse();
    if (sortedDates.length > 0) {
      const todayStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
      if (sortedDates[0] === todayStr) {
        continuousDays = 1;
        for (let i = 1; i < sortedDates.length; i++) {
          const prevDate = new Date(sortedDates[i - 1]);
          const currDate = new Date(sortedDates[i]);
          const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            continuousDays++;
          } else {
            break;
          }
        }
      }
    }

    this.setData({
      totalDays: uniqueDays.size,
      continuousDays,
      todayHours: todayHours.toFixed(1)
    });
  },

  showAddModal() {
    this.setData({
      showModal: true,
      selectedSubject: '',
      selectedColor: '',
      selectedDuration: '',
      content: ''
    });
  },

  hideModal() {
    this.setData({ showModal: false });
  },

  stopPropagation() {
  },

  selectSubject(e) {
    const { subject, color } = e.currentTarget.dataset;
    this.setData({
      selectedSubject: subject,
      selectedColor: color
    });
  },

  selectDuration(e) {
    const { duration } = e.currentTarget.dataset;
    this.setData({ selectedDuration: parseFloat(duration) });
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },

  addRecord() {
    const { selectedSubject, selectedColor, selectedDuration, content } = this.data;
    
    if (!selectedSubject) {
      wx.showToast({ title: '请选择学习科目', icon: 'none' });
      return;
    }
    if (!selectedDuration) {
      wx.showToast({ title: '请选择学习时长', icon: 'none' });
      return;
    }
    if (!content.trim()) {
      wx.showToast({ title: '请输入学习内容', icon: 'none' });
      return;
    }

    try {
      const recordsStr = wx.getStorageSync('studyRecords') || '[]';
      const records = JSON.parse(recordsStr);
      
      records.push({
        _id: Date.now().toString(),
        subject: selectedSubject,
        color: selectedColor,
        duration: selectedDuration,
        content: content.trim(),
        createTime: new Date().toISOString()
      });

      wx.setStorageSync('studyRecords', JSON.stringify(records));

      wx.showToast({ title: '打卡成功', icon: 'success' });
      this.hideModal();
      this.loadRecords();
    } catch (err) {
      console.error('添加记录失败:', err);
      wx.showToast({ title: '打卡失败', icon: 'none' });
    }
  },

  goToDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  }
});
