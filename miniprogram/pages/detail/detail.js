Page({
  data: {
    record: {},
    showEdit: false,
    showDeleteModal: false,
    editData: {
      subject: '',
      color: '',
      duration: '',
      content: ''
    },
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
    recordId: ''
  },

  onLoad(options) {
    const { id } = options;
    this.setData({ recordId: id });
    this.loadRecord(id);
  },

  loadRecord(id) {
    try {
      const recordsStr = wx.getStorageSync('studyRecords') || '[]';
      const records = JSON.parse(recordsStr);
      const record = records.find(item => item._id === id);
      
      if (!record) {
        wx.showToast({ title: '记录不存在', icon: 'none' });
        return;
      }
      
      const date = new Date(record.createTime);
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      
      this.setData({
        record: {
          ...record,
          month: date.getMonth() + 1,
          day: date.getDate(),
          weekDay: weekDays[date.getDay()],
          time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
        },
        editData: {
          subject: record.subject,
          color: record.color,
          duration: record.duration,
          content: record.content
        }
      });
    } catch (err) {
      console.error('加载记录失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  toggleEdit() {
    const { showEdit } = this.data;
    if (!showEdit) {
      const { record } = this.data;
      this.setData({
        editData: {
          subject: record.subject,
          color: record.color,
          duration: record.duration,
          content: record.content
        }
      });
    }
    this.setData({ showEdit: !showEdit });
  },

  selectEditSubject(e) {
    const { subject, color } = e.currentTarget.dataset;
    this.setData({
      'editData.subject': subject,
      'editData.color': color
    });
  },

  selectEditDuration(e) {
    const { duration } = e.currentTarget.dataset;
    this.setData({ 'editData.duration': parseFloat(duration) });
  },

  onEditContentInput(e) {
    this.setData({ 'editData.content': e.detail.value });
  },

  updateRecord() {
    const { recordId, editData } = this.data;
    
    if (!editData.subject) {
      wx.showToast({ title: '请选择学习科目', icon: 'none' });
      return;
    }
    if (!editData.duration) {
      wx.showToast({ title: '请选择学习时长', icon: 'none' });
      return;
    }
    if (!editData.content.trim()) {
      wx.showToast({ title: '请输入学习内容', icon: 'none' });
      return;
    }

    try {
      const recordsStr = wx.getStorageSync('studyRecords') || '[]';
      const records = JSON.parse(recordsStr);
      const index = records.findIndex(item => item._id === recordId);
      
      if (index !== -1) {
        records[index] = {
          ...records[index],
          subject: editData.subject,
          color: editData.color,
          duration: editData.duration,
          content: editData.content.trim()
        };
        wx.setStorageSync('studyRecords', JSON.stringify(records));
        
        wx.showToast({ title: '更新成功', icon: 'success' });
        this.setData({ showEdit: false });
        this.loadRecord(recordId);
      } else {
        wx.showToast({ title: '记录不存在', icon: 'none' });
      }
    } catch (err) {
      console.error('更新记录失败:', err);
      wx.showToast({ title: '更新失败', icon: 'none' });
    }
  },

  showDeleteConfirm() {
    this.setData({ showDeleteModal: true });
  },

  hideDeleteModal() {
    this.setData({ showDeleteModal: false });
  },

  stopPropagation() {
  },

  deleteRecord() {
    const { recordId } = this.data;
    
    try {
      const recordsStr = wx.getStorageSync('studyRecords') || '[]';
      const records = JSON.parse(recordsStr);
      const filteredRecords = records.filter(item => item._id !== recordId);
      
      wx.setStorageSync('studyRecords', JSON.stringify(filteredRecords));
      
      wx.showToast({ title: '删除成功', icon: 'success' });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      console.error('删除记录失败:', err);
      wx.showToast({ title: '删除失败', icon: 'none' });
    }
  }
});
