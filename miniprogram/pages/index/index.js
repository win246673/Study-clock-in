Page({
  data: {
    currentDate: '',
    records: [],
    totalDays: 0,
    continuousDays: 0,
    todayHours: 0,
    
    showModal: false,
    subjects: [
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
    ],
    durations: [
      { label: '0.5小时', value: 0.5 },
      { label: '1小时', value: 1 },
      { label: '1.5小时', value: 1.5 },
      { label: '2小时', value: 2 },
      { label: '2.5小时', value: 2.5 },
      { label: '3小时', value: 3 },
      { label: '3.5小时', value: 3.5 },
      { label: '4小时', value: 4 },
    ],
    selectedSubject: '',
    selectedColor: '',
    selectedDuration: '',
    content: '',
  },

  onLoad() {
    this.initDate();
    this.loadRecords();
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
